const mongoose = require('mongoose');

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reline';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB database.'))
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    });

const enquirySchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['contact', 'chatbot'] },
    name: String,
    email: String,
    phone: String,
    message: String,
    status: { type: String, default: 'pending', enum: ['pending', 'resolved'] },
    timestamp: { type: Date, default: Date.now }
});

// Automatically transform _id to id in JSON output
enquirySchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);

const applicationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    expectedSalary: String,
    profileUrl: String,
    resumeUrl: { type: String, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'reviewed', 'rejected'] },
    timestamp: { type: Date, default: Date.now }
});

applicationSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = {
    Enquiry,
    Application
};
