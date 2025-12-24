# Hostinger Deployment Guide

Complete guide for deploying your AI Video Interviewer application on Hostinger Business plan with Node.js Web App support.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [x] ✅ Hostinger Business plan with Node.js Web App support
- [x] ✅ MongoDB Atlas account (free tier available)
- [x] ✅ LiveKit Cloud account (free tier available)
- [x] ✅ OpenAI API key
- [x] ✅ Your frontend deployed (separate hosting or Hostinger)
- [x] ✅ All code changes applied (see below)

---

## 🔧 Code Changes Made for Hostinger

### Backend Changes

1. **`server.js`**:
   - ✅ Removed hardcoded port fallback (uses `process.env.PORT` only)
   - ✅ Made `dotenv` optional (only loads in development)
   - ✅ Fixed health endpoint to return `{ status: "ok" }`
   - ✅ Production-safe CORS configuration
   - ✅ Validates PORT environment variable on startup

2. **`services/memory.js`**:
   - ✅ Removed localhost MongoDB fallback
   - ✅ Requires `MONGODB_URI` environment variable (MongoDB Atlas)
   - ✅ Better error messages for missing configuration

3. **All services verified**:
   - ✅ OpenAI services use `OPENAI_API_KEY` from environment
   - ✅ LiveKit uses `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
   - ✅ No hardcoded secrets

### Frontend Changes

- ✅ Uses `VITE_API_URL` environment variable
- ✅ Localhost fallback only for development (Vite handles this)

---

## 🚀 Step-by-Step Deployment

### Step 1: Prepare MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose **FREE (M0)** tier
   - Select region closest to your Hostinger server
   - Cluster name: `ai-interviewer-cluster`
   - Click "Create"

3. **Create Database User**
   - Go to **Database Access**
   - Click "Add New Database User"
   - Username: `ai-interviewer-user`
   - Password: Generate secure password (save it!)
   - Database User Privileges: **"Read and write to any database"**
   - Click "Add User"

4. **Whitelist IP Address**
   - Go to **Network Access**
   - Click "Add IP Address"
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Or add your Hostinger server IP if you know it
   - Click "Confirm"

5. **Get Connection String**
   - Go to **Database** → Click "Connect"
   - Choose **"Connect your application"**
   - Driver: **Node.js**, Version: **5.5 or later**
   - Copy connection string:
     ```
     mongodb+srv://ai-interviewer-user:<password>@ai-interviewer-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://...mongodb.net/ai_interviewer?retryWrites=true&w=majority`

---

### Step 2: Set Up LiveKit Cloud

1. **Create LiveKit Cloud Account**
   - Go to [cloud.livekit.io](https://cloud.livekit.io)
   - Sign up for free account

2. **Create Project**
   - Click "Create Project"
   - Project name: `ai-video-interviewer`
   - Choose region closest to your users
   - Click "Create"

3. **Get Credentials**
   - Go to **Settings** → **API Keys**
   - Copy:
     - **Server URL**: `wss://your-project.livekit.cloud`
     - **API Key**: `APxxxxxxxxxxxxx`
     - **API Secret**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### Step 3: Upload Backend to Hostinger

1. **Access Hostinger hPanel**
   - Log in to your Hostinger account
   - Go to **hPanel**

2. **Navigate to Node.js Web App**
   - Find **"Node.js"** or **"Web Apps"** section
   - Click **"Create Node.js App"** or **"Add Application"**

3. **Configure Application**
   - **App Name**: `ai-video-interviewer-backend`
   - **Node.js Version**: Select **Node.js 24** (or latest available)
   - **App Root**: `/backend` (or root if you upload only backend folder)
   - **Start Command**: `npm start`
   - **Port**: Leave empty (Hostinger sets this automatically)

4. **Upload Files**
   - Use **File Manager** or **FTP/SFTP**
   - Upload your `backend` folder contents to the app root directory
   - Ensure `package.json` and `server.js` are in the root

5. **Install Dependencies**
   - In hPanel, go to your Node.js app
   - Click **"Terminal"** or **"SSH"**
   - Run:
     ```bash
     npm install --production
     ```

---

### Step 4: Configure Environment Variables

In Hostinger hPanel, go to your Node.js app → **Environment Variables** and add:

#### Required Environment Variables

```bash
# Server Configuration
PORT=8080
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com

# MongoDB Atlas
MONGODB_URI=mongodb+srv://ai-interviewer-user:your_password@ai-interviewer-cluster.xxxxx.mongodb.net/ai_interviewer?retryWrites=true&w=majority
MONGODB_DB_NAME=ai_interviewer

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here

# LiveKit Cloud
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=APxxxxxxxxxxxxx
LIVEKIT_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Environment Variables Reference

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port (Hostinger sets this) | `8080` | ✅ Yes |
| `NODE_ENV` | Environment mode | `production` | ✅ Yes |
| `FRONTEND_URL` | Your frontend URL (for CORS) | `https://yourdomain.com` | ✅ Yes |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` | ✅ Yes |
| `MONGODB_DB_NAME` | Database name | `ai_interviewer` | ✅ Yes |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` | ✅ Yes |
| `LIVEKIT_URL` | LiveKit Cloud server URL | `wss://...livekit.cloud` | ✅ Yes |
| `LIVEKIT_API_KEY` | LiveKit API key | `AP...` | ✅ Yes |
| `LIVEKIT_API_SECRET` | LiveKit API secret | `sk_live_...` | ✅ Yes |

**Important Notes:**
- Replace all placeholder values with your actual credentials
- Do NOT include quotes around values in Hostinger
- Ensure `FRONTEND_URL` matches your frontend domain exactly (including `https://`)
- If you have multiple frontend URLs, separate them with commas: `https://domain1.com,https://domain2.com`

---

### Step 5: Start the Application

1. **In Hostinger hPanel**:
   - Go to your Node.js app
   - Click **"Restart"** or **"Start"**
   - Wait for the app to start (usually 30-60 seconds)

2. **Check Logs**:
   - Click **"Logs"** in hPanel
   - Look for: `Server running on port XXXX`
   - Look for: `Connected to MongoDB Atlas: ai_interviewer`
   - If you see errors, check the troubleshooting section

3. **Test Health Endpoint**:
   - Your backend URL will be something like: `https://your-app.hostinger.com`
   - Test: `https://your-app.hostinger.com/health`
   - Should return: `{"status":"ok"}`

---

### Step 6: Configure Frontend

1. **Update Frontend Environment Variable**:
   - In your frontend build/deployment:
   - Set `VITE_API_URL` to your backend URL:
     ```
     VITE_API_URL=https://your-app.hostinger.com/api
     ```

2. **Rebuild Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy Frontend**:
   - Upload `frontend/dist` to your frontend hosting
   - Or deploy to Hostinger static hosting if available

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Backend health endpoint works: `https://your-app.hostinger.com/health`
- [ ] Backend returns `{"status":"ok"}` from `/health`
- [ ] MongoDB connection successful (check logs)
- [ ] LiveKit token generation works: `POST /api/token/generate`
- [ ] Resume upload works: `POST /api/resume/upload`
- [ ] Interview start works: `POST /api/interview/start`
- [ ] Frontend can connect to backend (check browser console)
- [ ] CORS is working (no CORS errors in browser)
- [ ] All environment variables are set correctly

---

## 🔍 Testing Your Deployment

### Test Backend Endpoints

1. **Health Check**:
   ```bash
   curl https://your-app.hostinger.com/health
   # Expected: {"status":"ok"}
   ```

2. **Test Token Generation** (requires authentication or test from frontend):
   ```bash
   curl -X POST https://your-app.hostinger.com/api/token/generate \
     -H "Content-Type: application/json" \
     -d '{"roomName":"test-room","participantName":"test-user"}'
   ```

### Test from Frontend

1. Open your frontend application
2. Try uploading a resume
3. Check browser console for errors
4. Check Network tab for API calls
5. Verify CORS headers are present

---

## 🐛 Troubleshooting

### Issue: "PORT environment variable is not set"

**Solution:**
- Hostinger should set PORT automatically
- If not, add `PORT=8080` in environment variables
- Check Hostinger Node.js app settings

### Issue: "MONGODB_URI environment variable is required"

**Solution:**
- Verify `MONGODB_URI` is set in Hostinger environment variables
- Check connection string format (should start with `mongodb+srv://`)
- Ensure password is URL-encoded if it contains special characters

### Issue: "FRONTEND_URL environment variable must be set in production"

**Solution:**
- Add `FRONTEND_URL` to environment variables
- Format: `https://your-frontend-domain.com` (no trailing slash)
- For multiple domains: `https://domain1.com,https://domain2.com`

### Issue: "Not allowed by CORS"

**Solution:**
- Verify `FRONTEND_URL` matches your frontend domain exactly
- Check for `https://` vs `http://` mismatch
- Ensure no trailing slashes
- Check browser console for the exact origin being blocked

### Issue: "Failed to initialize MongoDB"

**Solution:**
- Check MongoDB Atlas IP whitelist (should include 0.0.0.0/0 or your Hostinger IP)
- Verify connection string is correct
- Check MongoDB Atlas cluster is running
- Verify database user credentials

### Issue: "LiveKit token generation failed"

**Solution:**
- Verify `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` are set
- Check LiveKit Cloud project is active
- Verify API keys are correct in LiveKit Cloud dashboard

### Issue: "OPENAI_API_KEY environment variable is not set"

**Solution:**
- Add `OPENAI_API_KEY` to environment variables
- Verify the key is valid (starts with `sk-`)
- Check OpenAI account has credits/quota

### Issue: Application won't start

**Solution:**
1. Check logs in Hostinger hPanel
2. Verify `package.json` has correct `start` script: `"start": "node server.js"`
3. Verify Node.js version matches (should be 24)
4. Check all dependencies are installed: `npm install --production`
5. Verify `server.js` is in the root directory

### Issue: Health endpoint returns 404

**Solution:**
- Verify route is `/health` (not `/api/health`)
- Check server is running (check logs)
- Verify PORT is set correctly

---

## 📝 Hostinger-Specific Notes

### Port Configuration
- Hostinger sets `PORT` automatically
- Do NOT hardcode port in code
- The app listens on `process.env.PORT`

### File Structure
```
your-app-root/
├── server.js          (main entry file)
├── package.json
├── routes/
├── services/
└── temp/             (created automatically)
```

### Start Command
- Hostinger uses: `npm start`
- Ensure `package.json` has: `"start": "node server.js"`

### Environment Variables
- Set in hPanel → Node.js App → Environment Variables
- No `.env` file needed (and shouldn't be used in production)
- All secrets come from environment variables

### Logs
- Access logs in hPanel → Node.js App → Logs
- Logs show: server startup, MongoDB connection, errors

### Restarting
- Use hPanel → Node.js App → Restart
- Or restart via SSH/terminal if available

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use environment variables** - All secrets in Hostinger hPanel
3. **MongoDB Atlas** - Use strong passwords, limit IP access if possible
4. **LiveKit Cloud** - Rotate API keys regularly
5. **OpenAI API** - Set usage limits in OpenAI dashboard
6. **CORS** - Only allow your frontend domain(s)
7. **HTTPS** - Hostinger provides SSL automatically

---

## 📊 Monitoring

### Check Application Status

1. **Health Endpoint**: `https://your-app.hostinger.com/health`
2. **Logs**: hPanel → Node.js App → Logs
3. **Resource Usage**: hPanel → Node.js App → Resources

### Monitor These

- Server uptime (health endpoint)
- MongoDB connection status (logs)
- API response times
- Error rates (logs)
- Resource usage (CPU, memory)

---

## 🚀 Next Steps After Deployment

1. ✅ Test all features end-to-end
2. ✅ Set up monitoring/alerts if available
3. ✅ Configure custom domain (if needed)
4. ✅ Set up backups for MongoDB Atlas
5. ✅ Monitor costs (MongoDB Atlas, LiveKit Cloud, OpenAI)
6. ✅ Document your deployment for team

---

## 📞 Support Resources

- **Hostinger Support**: [support.hostinger.com](https://support.hostinger.com)
- **MongoDB Atlas Docs**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **LiveKit Cloud Docs**: [docs.livekit.io/cloud](https://docs.livekit.io/cloud)
- **OpenAI API Docs**: [platform.openai.com/docs](https://platform.openai.com/docs)

---

## ✅ Final Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Backend health endpoint working
- [ ] MongoDB Atlas connected
- [ ] LiveKit Cloud configured
- [ ] Frontend connected to backend
- [ ] CORS working correctly
- [ ] All features tested
- [ ] Logs checked for errors
- [ ] Security best practices followed

---

**Your application is now ready for production on Hostinger! 🎉**

