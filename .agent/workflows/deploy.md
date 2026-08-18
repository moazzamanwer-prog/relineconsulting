---
description: How to deploy the Reline Consulting Application
---
Here is the stepwise guide to deploying the Node.js Express server + SQLite database app.

## Step 1: Secure Your Repository
Before pushing your code, verify you have a `.gitignore` file active so your database and credentials are not committed:
- Build a `.gitignore` in the root folder.
- Ensure `node_modules/`, `.env`, and `reline.db` are listed.

## Step 2: Hosting Platform Selection

### Option A: Render (Easiest & Free Tier)
Render supports hosting node web servers and provides a free tier.

1. **Commit and Publish Your Repository**
   - Push your project code to a private GitHub/GitLab repository.
2. **Create a Web Service on Render**
   - Sign in to [Render](https://render.com) and create a **New Web Service**.
   - Connect your Git repository.
3. **Configure Settings**
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. **Define Variables**
   - Under the **Environment** tab, add your variables:
     - `PORT` = `3000` (Render handles port bindings automatically, but setting this is safe)
     - `ADMIN_USERNAME` = `your_username`
     - `ADMIN_PASSWORD` = `your_secure_password`
     - `ADMIN_TOKEN` = `your_dashboard_api_token`
5. **Set Up a Persistent Disk (SQLite Storage)**
   - Because Render instances have ephemeral filesystems (files reset on restarts/redeployments), your SQLite database `reline.db` will be wiped unless a persistent disk is mounted:
     - Navigate to the web service settings on Render, select **Disks**, and click **Add Disk**.
     - Set Mount Path: `/data` (e.g. `/data/reline.db`).
     - *Note: If you do this, make sure to update the database path in your server configuration (e.g. `process.env.DB_PATH || './reline.db'`).* 
     - **Recommendation**: For production apps, migrate the database from SQLite to a hosted Postgres DB like **Neon** or **Supabase** to avoid disk mounting.

---

### Option B: VPS Deployment (DigitalOcean, AWS, Linode)
Deploying on a Virtual Private Server (VPS) keeps SQLite fully persistent without virtual volume mounts.

1. **Provision and log in**
   - Provision a Linux Instance (Ubuntu). Log in via ssh.
2. **Install Node.js & Git**
   ```bash
   sudo apt update
   sudo apt install nodejs npm git -y
   ```
3. **Clone the Repo**
   ```bash
   git clone <your-repo-link>
   cd reline-consulting
   npm install
   ```
4. **Configure Environment**
   - Create the `.env` file manually inside the directory:
     ```bash
     nano .env
     ```
5. **Manage with PM2 Process Manager**
   - Install PM2 globally to keep the server running forever:
     ```bash
     sudo npm install -y pm2 -g
     pm2 start server.js --name "reline-server"
     pm2 save
     pm2 startup
     ```
6. **Set Up Nginx as Reverse Proxy**
   - Install Nginx:
     ```bash
     sudo apt install nginx -y
     ```
   - Configure Nginx proxy mapping port 80/443 to `http://localhost:3000`.
