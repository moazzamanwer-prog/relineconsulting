require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Enquiry, Application } = require('./db');
const multer = require('multer');
const fs = require('fs');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');

const uploadLocalDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadLocalDir)) {
    fs.mkdirSync(uploadLocalDir);
}

const localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadLocalDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
});
const uploadLocal = multer({ storage: localStorage });

const s3Config = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
});

const uploadS3 = multer({
    storage: multerS3({
        s3: s3Config,
        bucket: process.env.AWS_S3_BUCKET_NAME || 'my-bucket',
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, 'resumes/' + uniqueSuffix + path.extname(file.originalname))
        }
    })
});

const uploadMiddleware = (req, res, next) => {
    const isAwsConfigured = process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_S3_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID !== 'your_access_key';

    if (isAwsConfigured) {
        const s3Upload = uploadS3.single('resume');
        s3Upload(req, res, function (err) {
            if (err) {
                console.error("AWS S3 Upload failed, falling back to local storage:", err.message);
                uploadLocal.single('resume')(req, res, next);
            } else {
                next();
            }
        });
    } else {
        uploadLocal.single('resume')(req, res, next);
    }
};
const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'reline_secret_token';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));
// Serve uploads folder statically for admin
app.use('/uploads', express.static(uploadLocalDir));

// API: Admin Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        res.json({ success: true, token: ADMIN_TOKEN });
    } else {
        res.status(401).json({ error: 'Invalid username or password' });
    }
});

// API: Submit an enquiry (chatbot or contact form)
app.post('/api/enquiries', async (req, res) => {
    try {
        const { type, name, email, phone, message } = req.body;

        if (!type || !['contact', 'chatbot'].includes(type)) {
            return res.status(400).json({ error: 'Invalid enquiry type; must be contact or chatbot' });
        }

        // For contact form, name and email/message are required. Chatbot might just be a phone or email.
        if (type === 'contact' && (!name || !email || !message)) {
            return res.status(400).json({ error: 'Name, email, and message are required for contact enquiries' });
        }

        if (type === 'chatbot' && !message) {
            return res.status(400).json({ error: 'Enquiry details or phone number/email are required' });
        }

        const result = await Enquiry.create({
            type,
            name: name || undefined,
            email: email || undefined,
            phone: phone || undefined,
            message
        });

        res.status(201).json({
            success: true,
            message: 'Enquiry received successfully',
            id: result.id
        });
    } catch (err) {
        console.error('Error submitting enquiry:', err.message);
        res.status(500).json({ error: 'Failed to record enquiry' });
    }
});

// Middleware for Admin authorization check
const authorizeAdmin = (req, res, next) => {
    const token = req.headers['x-admin-token'] || req.query.token;
    if (token !== ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized: Invalid admin token' });
    }
    next();
};

// API: Get all enquiries
app.get('/api/enquiries', authorizeAdmin, async (req, res) => {
    try {
        const rows = await Enquiry.find().sort({ timestamp: -1 });
        res.json({ success: true, enquiries: rows });
    } catch (err) {
        console.error('Error fetching enquiries:', err.message);
        res.status(500).json({ error: 'Failed to fetch enquiries' });
    }
});

// API: Toggle enquiry status (pending <-> resolved)
app.patch('/api/enquiries/:id', authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['pending', 'resolved'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await Enquiry.findByIdAndUpdate(id, { status }, { new: true });

        if (!result) {
            return res.status(404).json({ error: 'Enquiry not found' });
        }

        res.json({ success: true, message: `Enquiry status updated to ${status}` });
    } catch (err) {
        console.error('Error updating enquiry status:', err.message);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// API: Delete an enquiry
app.delete('/api/enquiries/:id', authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Enquiry.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ error: 'Enquiry not found' });
        }

        res.json({ success: true, message: 'Enquiry deleted successfully' });
    } catch (err) {
        console.error('Error deleting enquiry:', err.message);
        res.status(500).json({ error: 'Failed to delete enquiry' });
    }
});

// API: Submit a job application
app.post('/api/careers/apply', uploadMiddleware, async (req, res) => {
    try {
        const { name, email, phone, expectedSalary, profileUrl } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Resume file is required' });
        }

        // multer-s3 attaches the public S3 URL to req.file.location
        // local storage uses req.file.filename
        const resumeUrl = req.file.location ? req.file.location : `/uploads/${req.file.filename}`;

        const result = await Application.create({
            name,
            email,
            phone,
            expectedSalary,
            profileUrl,
            resumeUrl
        });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            id: result.id
        });
    } catch (err) {
        console.error('Error submitting application:', err.message);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// API: Get all applications
app.get('/api/careers/applications', authorizeAdmin, async (req, res) => {
    try {
        const rows = await Application.find().sort({ timestamp: -1 });
        res.json({ success: true, applications: rows });
    } catch (err) {
        console.error('Error fetching applications:', err.message);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Admin dashboard: http://localhost:${PORT}/admin.html`);
});
