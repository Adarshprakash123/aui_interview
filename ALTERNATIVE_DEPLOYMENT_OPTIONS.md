# Alternative Backend Deployment Options (Non-Hostinger)

Since you don't want to deploy on Hostinger, here are the best alternatives for deploying your Node.js backend with Docker support.

---

## 🚀 Quick Comparison

| Platform | Cost/Month | Setup Time | Difficulty | Docker Support | Best For |
|----------|------------|------------|------------|----------------|----------|
| **Railway** | $5-20 | 10 min | ⭐ Easy | ✅ Yes | Quick deployment |
| **Render** | $7-25 | 15 min | ⭐ Easy | ✅ Yes | Simple & reliable |
| **Fly.io** | $5-15 | 20 min | ⭐⭐ Medium | ✅ Yes | Global edge |
| **DigitalOcean App Platform** | $5-12 | 20 min | ⭐⭐ Medium | ✅ Yes | Simple PaaS |
| **AWS Elastic Beanstalk** | $15-30 | 30 min | ⭐⭐ Medium | ✅ Yes | Enterprise |
| **Google Cloud Run** | Pay-per-use | 25 min | ⭐⭐⭐ Medium | ✅ Yes | Serverless |
| **Heroku** | $7-25 | 15 min | ⭐ Easy | ✅ Yes | Classic PaaS |

---

## Option 1: Railway (Recommended - Easiest) ⭐

**Why Railway?**
- ✅ Easiest setup (10 minutes)
- ✅ Automatic deployments from Git
- ✅ Free tier available ($5 credit/month)
- ✅ Built-in environment variables
- ✅ HTTPS by default
- ✅ Great for Node.js apps

**Cost**: $5-20/month (after free credit)

### Step-by-Step:

#### 1. Sign Up
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Get $5 free credit

#### 2. Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository
4. Select the `backend` folder

#### 3. Configure Deployment
Railway will auto-detect your Dockerfile. If not:
1. Go to **Settings** → **Build**
2. Set **Root Directory**: `backend`
3. Railway will use your Dockerfile automatically

#### 4. Set Environment Variables
Go to **Variables** tab and add:

```bash
PORT=8080
NODE_ENV=production
OPENAI_API_KEY=your_openai_key
# LiveKit Cloud: wss://your-project.livekit.cloud
# Self-hosted: wss://your-server-domain.com
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_key
LIVEKIT_API_SECRET=your_livekit_secret
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/ai_interviewer
MONGODB_DB_NAME=ai_interviewer
FRONTEND_URL=https://your-frontend-url.com
```

**Note**: See the "LiveKit Configuration Guide" section below for details on setting up LiveKit Cloud or self-hosted server.

#### 5. Deploy
1. Railway will automatically deploy
2. Wait 2-3 minutes
3. Get your backend URL (e.g., `https://your-app.up.railway.app`)

#### 6. Update Frontend
Update your frontend's `VITE_API_URL` to: `https://your-app.up.railway.app/api`

**That's it!** Railway handles everything else.

---

## Option 2: Render ⭐

**Why Render?**
- ✅ Very simple setup
- ✅ Free tier available (with limitations)
- ✅ Automatic SSL
- ✅ Great documentation

**Cost**: $7/month (Starter plan) or Free tier (sleeps after inactivity)

### Step-by-Step:

#### 1. Sign Up
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

#### 2. Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ai-video-interviewer-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Docker Context**: `backend`

#### 3. Set Environment Variables
In the **Environment** section, add all variables:

```bash
PORT=8080
NODE_ENV=production
OPENAI_API_KEY=your_openai_key
# LiveKit Cloud: wss://your-project.livekit.cloud
# Self-hosted: wss://your-server-domain.com
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_key
LIVEKIT_API_SECRET=your_livekit_secret
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/ai_interviewer
MONGODB_DB_NAME=ai_interviewer
FRONTEND_URL=https://your-frontend-url.com
```

#### 4. Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for first deployment
3. Get your URL: `https://your-app.onrender.com`

#### 5. Update Frontend
Update `VITE_API_URL` to: `https://your-app.onrender.com/api`

**Note**: Free tier services sleep after 15 minutes of inactivity. Upgrade to paid plan for always-on.

---

## Option 3: Fly.io ⭐⭐

**Why Fly.io?**
- ✅ Global edge deployment
- ✅ Great performance
- ✅ Generous free tier
- ✅ Docker-native

**Cost**: $5-15/month (or free tier with limits)

### Step-by-Step:

#### 1. Install Fly CLI
```bash
# Mac
curl -L https://fly.io/install.sh | sh

# Or with Homebrew
brew install flyctl
```

#### 2. Sign Up & Login
```bash
fly auth signup
# Or if you have an account:
fly auth login
```

#### 3. Initialize App
```bash
cd backend
fly launch
```

This will:
- Detect your Dockerfile
- Ask for app name (e.g., `ai-video-interviewer-backend`)
- Ask for region (choose closest)
- Create `fly.toml` config file

#### 4. Set Environment Variables
```bash
fly secrets set \
  PORT=8080 \
  NODE_ENV=production \
  OPENAI_API_KEY=your_openai_key \
  LIVEKIT_URL=wss://your-livekit-server.com \
  LIVEKIT_API_KEY=your_livekit_key \
  LIVEKIT_API_SECRET=your_livekit_secret \
  MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/ai_interviewer \
  MONGODB_DB_NAME=ai_interviewer \
  FRONTEND_URL=https://your-frontend-url.com
```

#### 5. Deploy
```bash
fly deploy
```

#### 6. Get URL
```bash
fly status
# Your app will be at: https://your-app-name.fly.dev
```

#### 7. Update Frontend
Update `VITE_API_URL` to: `https://your-app-name.fly.dev/api`

---

## Option 4: DigitalOcean App Platform ⭐⭐

**Why DigitalOcean?**
- ✅ Simple PaaS
- ✅ Good pricing
- ✅ Reliable infrastructure
- ✅ Easy scaling

**Cost**: $5-12/month (Basic plan)

### Step-by-Step:

#### 1. Sign Up
1. Go to [digitalocean.com](https://www.digitalocean.com)
2. Create account (get $200 free credit)

#### 2. Create App
1. Go to **App Platform**
2. Click **"Create App"**
3. Connect GitHub repository
4. Select your repository

#### 3. Configure Backend
1. **Service Type**: Web Service
2. **Source Directory**: `backend`
3. **Build Command**: (leave empty, Docker handles it)
4. **Run Command**: (leave empty, Docker handles it)
5. **HTTP Port**: `8080`
6. **Environment**: Dockerfile

#### 4. Set Environment Variables
Add all required variables in the **Environment Variables** section.

#### 5. Deploy
1. Click **"Create Resources"**
2. Wait 5-10 minutes
3. Get your URL: `https://your-app-xxxxx.ondigitalocean.app`

#### 6. Update Frontend
Update `VITE_API_URL` to your DigitalOcean app URL.

---

## Option 5: AWS Elastic Beanstalk (Already Documented)

See `AWS_DEPLOYMENT_STEPS.md` for detailed instructions.

**Cost**: $15-30/month  
**Difficulty**: ⭐⭐ Medium

---

## Option 6: Google Cloud Run ⭐⭐⭐

**Why Cloud Run?**
- ✅ Serverless (pay per request)
- ✅ Auto-scaling
- ✅ Very cost-effective for low traffic
- ✅ Docker-native

**Cost**: Pay-per-use (~$5-15/month for moderate traffic)

### Step-by-Step:

#### 1. Install Google Cloud SDK
```bash
# Mac
brew install google-cloud-sdk

# Or download from: https://cloud.google.com/sdk/docs/install
```

#### 2. Login & Setup
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

#### 3. Enable APIs
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

#### 4. Build & Deploy
```bash
cd backend

# Build and deploy in one command
gcloud run deploy ai-video-interviewer-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "NODE_ENV=production,PORT=8080" \
  --set-secrets "OPENAI_API_KEY=openai-key:latest,LIVEKIT_API_KEY=livekit-key:latest,LIVEKIT_API_SECRET=livekit-secret:latest,MONGODB_URI=mongodb-uri:latest"
```

#### 5. Set Secrets (Recommended)
```bash
# Create secrets in Secret Manager first
echo -n "your_openai_key" | gcloud secrets create openai-key --data-file=-
echo -n "your_livekit_key" | gcloud secrets create livekit-key --data-file=-
echo -n "your_livekit_secret" | gcloud secrets create livekit-secret --data-file=-
echo -n "mongodb+srv://..." | gcloud secrets create mongodb-uri --data-file=-

# Then reference in deployment (as shown above)
```

#### 6. Get URL
After deployment, you'll get a URL like:
`https://ai-video-interviewer-backend-xxxxx-uc.a.run.app`

---

## Option 7: Heroku ⭐

**Why Heroku?**
- ✅ Very easy setup
- ✅ Great for Node.js
- ✅ Add-ons ecosystem

**Cost**: $7/month (Eco dyno) or $25/month (Basic)

### Step-by-Step:

#### 1. Install Heroku CLI
```bash
# Mac
brew tap heroku/brew && brew install heroku

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

#### 2. Login
```bash
heroku login
```

#### 3. Create App
```bash
cd backend
heroku create ai-video-interviewer-backend
```

#### 4. Set Buildpack (for Docker)
```bash
heroku stack:set container
```

#### 5. Set Environment Variables
```bash
heroku config:set \
  PORT=8080 \
  NODE_ENV=production \
  OPENAI_API_KEY=your_openai_key \
  LIVEKIT_URL=wss://your-livekit-server.com \
  LIVEKIT_API_KEY=your_livekit_key \
  LIVEKIT_API_SECRET=your_livekit_secret \
  MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/ai_interviewer \
  MONGODB_DB_NAME=ai_interviewer \
  FRONTEND_URL=https://your-frontend-url.com
```

#### 6. Deploy
```bash
git push heroku main
# Or if your branch is master:
git push heroku master
```

#### 7. Get URL
```bash
heroku info
# Your app will be at: https://ai-video-interviewer-backend.herokuapp.com
```

---

## 🎯 Recommended Choice

**For Quick Deployment**: **Railway** or **Render**
- Easiest setup
- Good free tiers
- Automatic deployments

**For Production**: **Fly.io** or **DigitalOcean**
- Better performance
- More control
- Reliable infrastructure

**For Cost Optimization**: **Google Cloud Run**
- Pay only for what you use
- Auto-scaling
- Great for variable traffic

---

## 🎥 LiveKit Configuration Guide

Your app uses LiveKit for video/audio streaming. You need to decide whether to use **LiveKit Cloud** (managed) or **self-hosted LiveKit server**.

### Option A: LiveKit Cloud (Recommended for Most Users) ⭐

**Why LiveKit Cloud?**
- ✅ No server management needed
- ✅ Automatic scaling
- ✅ Global edge network
- ✅ Free tier available
- ✅ Easy setup

**Cost**: Free tier (up to 10,000 participant minutes/month) or paid plans starting at $99/month

#### Setup Steps:

1. **Sign Up for LiveKit Cloud**
   - Go to [cloud.livekit.io](https://cloud.livekit.io)
   - Sign up for free account
   - Create a new project

2. **Get Your Credentials**
   - Go to your project → **Settings** → **API Keys**
   - Create a new API key (or use default)
   - Copy:
     - **API Key** (e.g., `APxxxxxxxxxxxxx`)
     - **API Secret** (e.g., `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
     - **Server URL** (e.g., `wss://your-project.livekit.cloud`)

3. **Set Environment Variables**
   In your backend deployment platform, set:
   ```bash
   LIVEKIT_URL=wss://your-project.livekit.cloud
   LIVEKIT_API_KEY=APxxxxxxxxxxxxx
   LIVEKIT_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. **That's it!** Your backend will generate tokens that connect to LiveKit Cloud.

---

### Option B: Self-Hosted LiveKit Server

**Why Self-Host?**
- ✅ Full control
- ✅ No per-minute costs
- ✅ Custom configuration
- ✅ Data stays on your infrastructure

**Cost**: Server costs (~$20-50/month for a decent VPS)

#### Setup Steps:

1. **Deploy LiveKit Server**
   You can deploy LiveKit server on:
   - **Docker** (easiest)
   - **Kubernetes**
   - **Any VPS** (DigitalOcean, AWS EC2, etc.)

2. **Quick Docker Setup**:
   ```bash
   # Create docker-compose.yml
   version: '3.8'
   services:
     livekit:
       image: livekit/livekit-server:latest
       ports:
         - "7880:7880"  # HTTP
         - "7881:7881"  # WebRTC TCP
         - "7882:7882/udp"  # WebRTC UDP
         - "50000-60000:50000-60000/udp"  # RTP
       environment:
         - LIVEKIT_KEYS=your_api_key:your_api_secret
       command: --dev
   ```

3. **Get Your Server URL**
   - If self-hosted: `wss://your-server-domain.com` or `ws://your-server-ip:7880`
   - Make sure your server has:
     - Public IP or domain
     - Ports 7880, 7881, 7882, and 50000-60000 open
     - SSL certificate (for production, use `wss://`)

4. **Set Environment Variables**
   ```bash
   LIVEKIT_URL=wss://your-server-domain.com
   LIVEKIT_API_KEY=your_api_key
   LIVEKIT_API_SECRET=your_api_secret
   ```

---

### How to Check Which You're Using

Your code uses the `LIVEKIT_URL` environment variable. Check your `.env` file or deployment platform:

- **LiveKit Cloud**: URL will be `wss://something.livekit.cloud`
- **Self-hosted**: URL will be `wss://your-domain.com` or `ws://your-ip:port`

### Recommendation

**For most users**: Start with **LiveKit Cloud** (free tier)
- Easier setup
- No server management
- Free tier is generous for testing
- Upgrade later if needed

**For production with high traffic**: Consider self-hosting or LiveKit Cloud paid plans

---

## 📋 Pre-Deployment Checklist

Before deploying anywhere, make sure:

- [ ] Your Dockerfile is working locally
- [ ] All environment variables are documented
- [ ] MongoDB Atlas is set up and accessible
- [ ] **LiveKit is configured** (Cloud or self-hosted)
  - [ ] LiveKit URL is set
  - [ ] LiveKit API Key is set
  - [ ] LiveKit API Secret is set
- [ ] OpenAI API key is ready
- [ ] Frontend URL is known (for CORS)

### Test Docker Locally First:
```bash
cd backend

# Build image
docker build -t ai-video-backend .

# Run locally
docker run -p 8080:8080 \
  -e PORT=8080 \
  -e NODE_ENV=production \
  -e OPENAI_API_KEY=your_key \
  -e LIVEKIT_URL=wss://your-server.com \
  -e LIVEKIT_API_KEY=your_key \
  -e LIVEKIT_API_SECRET=your_secret \
  -e MONGODB_URI=your_mongodb_uri \
  -e MONGODB_DB_NAME=ai_interviewer \
  ai-video-backend

# Test health endpoint
curl http://localhost:8080/health
```

---

## 🔧 Common Issues & Fixes

### Port Configuration
Your Dockerfile exposes port 8080, but `server.js` defaults to 5001. Make sure to set:
```bash
PORT=8080
```
in all deployment platforms.

### CORS Issues
Make sure `FRONTEND_URL` is set correctly in backend environment variables.

### MongoDB Connection
- Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0` (or your platform's IP range)
- Verify connection string format
- Check database name matches

### Health Check
Your Dockerfile has a health check. Make sure `/health` endpoint works:
```bash
curl https://your-backend-url.com/health
```

---

## 📊 Cost Comparison (Monthly)

| Platform | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| Railway | $5 credit | $5-20 | Quick start |
| Render | Limited | $7-25 | Simple apps |
| Fly.io | Generous | $5-15 | Global apps |
| DigitalOcean | $200 credit | $5-12 | Balanced |
| AWS EB | None | $15-30 | Enterprise |
| Cloud Run | Generous | Pay-per-use | Variable traffic |
| Heroku | None | $7-25 | Classic PaaS |

---

## 🚀 Next Steps After Deployment

1. **Test all endpoints**:
   - `/health`
   - `/api/resume/upload`
   - `/api/token/generate`

2. **Update frontend**:
   - Set `VITE_API_URL` to your new backend URL
   - Redeploy frontend

3. **Monitor**:
   - Set up error tracking (Sentry, etc.)
   - Monitor logs
   - Set up uptime monitoring

4. **Security**:
   - Enable HTTPS (most platforms do this automatically)
   - Review CORS settings
   - Rotate API keys regularly

---

## 💡 Pro Tips

1. **Use Environment Variables**: Never hardcode secrets
2. **Test Locally First**: Always test Docker build locally
3. **Monitor Costs**: Set up billing alerts
4. **Use Secrets Management**: For production, use platform secrets managers
5. **Enable Logging**: Most platforms provide built-in logging
6. **Set Up CI/CD**: Connect GitHub for automatic deployments

---

## 🆘 Need Help?

- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Render**: [render.com/docs](https://render.com/docs)
- **Fly.io**: [fly.io/docs](https://fly.io/docs)
- **DigitalOcean**: [docs.digitalocean.com](https://docs.digitalocean.com)
- **Google Cloud**: [cloud.google.com/run/docs](https://cloud.google.com/run/docs)

---

**Recommended for you**: Start with **Railway** or **Render** for the easiest deployment experience!

