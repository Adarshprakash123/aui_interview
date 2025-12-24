# AWS Deployment - Step by Step Guide

## Quick Start: Option 1 (Recommended)

### Prerequisites
- AWS Account
- AWS CLI installed: `brew install awscli` (Mac) or [download](https://aws.amazon.com/cli/)
- EB CLI installed: `pip install awsebcli`
- Git repository (optional, but recommended)

---

## Part 1: Frontend Deployment (AWS Amplify)

### Step 1: Build Frontend Locally
```bash
cd frontend
npm install
npm run build
```

This creates a `dist` folder with production-ready files.

### Step 2: Deploy to Amplify

**Option A: Using AWS Console (Easiest)**
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click **"New app" → "Host web app"**
3. Choose **"Deploy without Git provider"**
4. Drag and drop your `frontend/dist` folder
5. App name: `ai-video-interviewer`
6. Click **"Save and deploy"**

**Option B: Using Git (Recommended for updates)**
1. Push your code to GitHub/GitLab/Bitbucket
2. In Amplify Console, click **"New app" → "Host web app"**
3. Choose your Git provider
4. Select repository and branch
5. Build settings (auto-detected):
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/dist
       files:
         - '**/*'
   ```
6. Click **"Save and deploy"**

### Step 3: Set Environment Variable
1. In Amplify app → **"Environment variables"**
2. Add: `VITE_API_URL` = `http://your-backend-url.elasticbeanstalk.com/api`
   (You'll update this after backend deployment)

**Result**: You get a URL like `https://main.d1234abcd.amplifyapp.com`

---

## Part 2: Backend Deployment (Elastic Beanstalk)

### Step 1: Install Required Tools

**AWS CLI:**
```bash
# Mac
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Windows: Download from AWS website
```

**EB CLI:**
```bash
pip install awsebcli
```

### Step 2: Configure AWS Credentials
```bash
aws configure
```
Enter:
- AWS Access Key ID: (from AWS IAM)
- AWS Secret Access Key: (from AWS IAM)
- Default region: `us-east-1` (or your preferred region)
- Default output format: `json`

### Step 3: Initialize Elastic Beanstalk
```bash
cd backend

# Initialize EB
eb init -p "Node.js 18" ai-video-interviewer --region us-east-1

# This will ask:
# - Select a region (choose one)
# - Set up SSH (optional, say no for now)
```

### Step 4: Create Environment
```bash
# Create production environment
eb create ai-video-interviewer-prod

# This takes 5-10 minutes. It will:
# - Create EC2 instance
# - Set up load balancer
# - Deploy your code
```

### Step 5: Set Environment Variables
```bash
eb setenv \
  OPENAI_API_KEY="your_openai_key_here" \
  LIVEKIT_URL="wss://your-livekit-server.com" \
  LIVEKIT_API_KEY="your_livekit_key" \
  LIVEKIT_API_SECRET="your_livekit_secret" \
  MONGODB_URI="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/ai_interviewer" \
  MONGODB_DB_NAME="ai_interviewer" \
  PORT=8080 \
  NODE_ENV=production
```

### Step 6: Get Backend URL
```bash
eb status
```

Copy the **CNAME** URL (e.g., `ai-video-interviewer-prod.elasticbeanstalk.com`)

### Step 7: Update Frontend Environment Variable
1. Go back to Amplify Console
2. Environment variables → Edit `VITE_API_URL`
3. Set to: `http://ai-video-interviewer-prod.elasticbeanstalk.com/api`
4. Save and redeploy

---

## Part 3: Database Setup (MongoDB Atlas)

### Step 1: Create Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up (free tier available)

### Step 2: Create Cluster
1. Click **"Build a Database"**
2. Choose **FREE (M0)** tier
3. Select region (choose closest to your AWS region)
4. Cluster name: `ai-interviewer-cluster`
5. Click **"Create"**

### Step 3: Create Database User
1. Go to **Database Access**
2. Click **"Add New Database User"**
3. Username: `ai-interviewer-user`
4. Password: (generate secure password, save it!)
5. Database User Privileges: **"Read and write to any database"**
6. Click **"Add User"**

### Step 4: Whitelist IP Addresses
1. Go to **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for EB)
   - Or add specific IP: `0.0.0.0/0`
4. Click **"Confirm"**

### Step 5: Get Connection String
1. Go to **Database** → Click **"Connect"**
2. Choose **"Connect your application"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy connection string:
   ```
   mongodb+srv://YOUR_USERNAME:<YOUR_PASSWORD>@YOUR_CLUSTER.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name: `mongodb+srv://...mongodb.net/ai_interviewer?retryWrites=true&w=majority`

### Step 6: Update Backend Environment Variable
```bash
eb setenv MONGODB_URI="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/ai_interviewer?retryWrites=true&w=majority"
```

---

## Part 4: Testing Deployment

### Step 1: Test Backend
```bash
# Check health endpoint
curl http://your-eb-url.elasticbeanstalk.com/health

# Should return: {"status":"ok","message":"AI Video Interviewer API is running"}
```

### Step 2: Test Frontend
1. Open your Amplify URL
2. Try uploading a resume
3. Check browser console for errors
4. Check Network tab for API calls

### Step 3: Check Logs
```bash
# View backend logs
eb logs

# Or in AWS Console:
# Elastic Beanstalk → Your app → Logs
```

---

## Part 5: Updating Deployment

### Update Backend:
```bash
cd backend
# Make your changes
eb deploy
```

### Update Frontend:
```bash
cd frontend
npm run build
# If using Git: push to repo (Amplify auto-deploys)
# If using manual: drag & drop new dist folder in Amplify
```

---

## Troubleshooting

### Backend Issues:

**Port Error:**
- EB uses port 8080, make sure `PORT=8080` in env vars

**CORS Error:**
- Update `server.js`:
  ```js
  app.use(cors({
    origin: ['https://your-amplify-url.amplifyapp.com'],
    credentials: true
  }));
  ```

**File Upload Too Large:**
- Already configured in `.ebextensions/01-nginx.config`

**MongoDB Connection Failed:**
- Check IP whitelist in MongoDB Atlas
- Verify connection string format
- Check EB logs: `eb logs`

### Frontend Issues:

**API Calls Failing:**
- Check `VITE_API_URL` in Amplify environment variables
- Verify backend is running: `eb status`
- Check CORS settings in backend

**Build Fails:**
- Check build logs in Amplify Console
- Verify `package.json` scripts are correct
- Check Node.js version compatibility

---

## Cost Monitoring

### Set Up Billing Alerts:
1. Go to **AWS Billing Dashboard**
2. **"Budgets"** → **"Create budget"**
3. Set limit: $50/month
4. Get email alerts at 80% and 100%

### Estimated Monthly Costs:
- **Amplify**: Free tier (5GB storage, 15GB bandwidth) or ~$1-5
- **Elastic Beanstalk**: ~$15-30 (t2.micro instance)
- **MongoDB Atlas**: Free tier (512MB) or ~$9 (M10)
- **S3**: ~$1-5 (for temp files)
- **Data Transfer**: ~$5-10

**Total: ~$20-50/month** (with free tiers)

---

## Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use AWS Secrets Manager** (for Option 2) instead of env vars
3. **Enable HTTPS** - Amplify provides it automatically
4. **Restrict MongoDB IPs** - Use specific IPs instead of 0.0.0.0/0
5. **Rotate API keys** regularly
6. **Enable CloudWatch logging** for monitoring

---

## Next Steps After Deployment

1. ✅ Test all features end-to-end
2. ✅ Set up CloudWatch alarms
3. ✅ Configure custom domain (optional)
4. ✅ Set up CI/CD pipeline (optional)
5. ✅ Monitor costs and usage

---

## Need Help?

- **AWS Support**: [AWS Documentation](https://docs.aws.amazon.com/)
- **Elastic Beanstalk**: [EB Docs](https://docs.aws.amazon.com/elasticbeanstalk/)
- **Amplify**: [Amplify Docs](https://docs.amplify.aws/)

