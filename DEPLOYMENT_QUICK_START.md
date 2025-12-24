# AWS Deployment - Quick Start Guide

## 🚀 Simplest Path: Amplify + Elastic Beanstalk

**Time Required**: 2-3 hours  
**Complexity**: ⭐⭐ (Low-Medium)  
**Monthly Cost**: ~$20-50

---

## Prerequisites Checklist

- [ ] AWS Account created
- [ ] AWS CLI installed (`aws --version`)
- [ ] EB CLI installed (`eb --version`)
- [ ] MongoDB Atlas account (free tier)
- [ ] LiveKit account (or self-hosted)

---

## Step 1: Frontend → AWS Amplify (15 minutes)

### 1.1 Build Frontend
```bash
cd frontend
npm install
npm run build
```

### 1.2 Deploy to Amplify
1. Go to: https://console.aws.amazon.com/amplify
2. Click **"New app" → "Host web app"**
3. Choose **"Deploy without Git provider"**
4. Drag & drop `frontend/dist` folder
5. Click **"Save and deploy"**
6. Wait 2-3 minutes
7. **Copy your Amplify URL** (e.g., `https://main.d1234abcd.amplifyapp.com`)

### 1.3 Set Environment Variable
1. In Amplify app → **"Environment variables"**
2. Add: `VITE_API_URL` = `http://placeholder.elasticbeanstalk.com/api`
   (We'll update this after backend is deployed)

---

## Step 2: Backend → Elastic Beanstalk (30 minutes)

### 2.1 Configure AWS
```bash
aws configure
```
Enter your AWS Access Key ID and Secret Access Key (from IAM)

### 2.2 Initialize EB
```bash
cd backend
eb init -p "Node.js 18" ai-video-interviewer --region us-east-1
```

### 2.3 Create Environment
```bash
eb create ai-video-interviewer-prod
```
⏳ Wait 5-10 minutes for deployment

### 2.4 Get Backend URL
```bash
eb status
```
Copy the **CNAME** (e.g., `ai-video-interviewer-prod.us-east-1.elasticbeanstalk.com`)

### 2.5 Set Environment Variables
```bash
eb setenv \
  OPENAI_API_KEY="sk-your-openai-key" \
  LIVEKIT_URL="wss://your-livekit-server.com" \
  LIVEKIT_API_KEY="your-livekit-key" \
  LIVEKIT_API_SECRET="your-livekit-secret" \
  MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/ai_interviewer" \
  MONGODB_DB_NAME="ai_interviewer" \
  PORT=8080 \
  NODE_ENV=production \
  FRONTEND_URL="https://your-amplify-url.amplifyapp.com"
```

### 2.6 Update Frontend URL
1. Go back to Amplify
2. Update `VITE_API_URL` to: `http://your-eb-cname.elasticbeanstalk.com/api`
3. Redeploy frontend

---

## Step 3: MongoDB Atlas (15 minutes)

### 3.1 Create Cluster
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create **FREE** cluster (M0)
3. Choose region close to your AWS region

### 3.2 Create User
1. **Database Access** → **"Add New Database User"**
2. Username: `ai-interviewer-user`
3. Password: (save it!)
4. Privileges: **"Read and write to any database"**

### 3.3 Whitelist IPs
1. **Network Access** → **"Add IP Address"**
2. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
3. Click **"Confirm"**

### 3.4 Get Connection String
1. **Database** → **"Connect"** → **"Connect your application"**
2. Copy connection string
3. Replace `<password>` with your password
4. Add database name: `...mongodb.net/ai_interviewer?retryWrites=true&w=majority`

### 3.5 Update Backend
```bash
eb setenv MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/ai_interviewer?retryWrites=true&w=majority"
```

---

## Step 4: Test Everything

### 4.1 Test Backend
```bash
curl http://your-eb-url.elasticbeanstalk.com/health
```
Should return: `{"status":"ok",...}`

### 4.2 Test Frontend
1. Open your Amplify URL
2. Try uploading a resume
3. Check browser console for errors

### 4.3 Check Logs
```bash
eb logs
```

---

## 🎯 That's It!

Your app should now be live at:
- **Frontend**: `https://your-app.amplifyapp.com`
- **Backend**: `http://your-app.elasticbeanstalk.com`

---

## 📊 Cost Breakdown

| Service | Cost |
|---------|------|
| Amplify (Free tier) | $0 |
| Elastic Beanstalk (t2.micro) | ~$15/month |
| MongoDB Atlas (Free tier) | $0 |
| Data Transfer | ~$5/month |
| **Total** | **~$20/month** |

---

## 🔧 Common Issues & Fixes

### CORS Error
Update backend CORS in `server.js` (already done) or:
```bash
eb setenv FRONTEND_URL="https://your-amplify-url.amplifyapp.com"
```

### Port Error
EB uses port 8080, make sure:
```bash
eb setenv PORT=8080
```

### MongoDB Connection Failed
- Check IP whitelist in Atlas (should be 0.0.0.0/0)
- Verify connection string format
- Check logs: `eb logs`

### File Upload Too Large
Already configured in `.ebextensions/01-nginx.config` (50MB limit)

---

## 📝 Next Steps

1. **Custom Domain** (optional):
   - Add domain in Amplify
   - Add domain in Route 53
   - Update CORS settings

2. **HTTPS for Backend** (optional):
   - Use Application Load Balancer with SSL certificate
   - Or use CloudFront in front of EB

3. **Monitoring**:
   - Set up CloudWatch alarms
   - Monitor costs in Billing Dashboard

4. **Scaling** (if needed):
   - Increase EB instance size
   - Add more instances
   - Use Auto Scaling

---

## 🆘 Need Help?

- **AWS Docs**: https://docs.aws.amazon.com/
- **EB Docs**: https://docs.aws.amazon.com/elasticbeanstalk/
- **Amplify Docs**: https://docs.amplify.aws/

---

**Estimated Total Time**: 2-3 hours  
**Difficulty**: Beginner-friendly with this guide

