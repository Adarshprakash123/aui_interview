# AWS Deployment Guide for AI Video Interviewer

This guide covers multiple deployment options from simplest to most scalable.

## Architecture Overview

```
┌─────────────┐
│   Frontend  │ → S3 + CloudFront (or Amplify)
│   (React)   │
└─────────────┘
       │
       ↓
┌─────────────┐
│   Backend   │ → EC2/Elastic Beanstalk/ECS
│  (Node.js)  │
└─────────────┘
       │
       ├──→ MongoDB Atlas (Recommended)
       ├──→ OpenAI API
       └──→ LiveKit Cloud
```

---

## Option 1: Simple Deployment (Recommended for MVP)

**Complexity: ⭐⭐ (Low-Medium)**  
**Cost: ~$20-50/month**  
**Best for: Testing, small scale, MVP**

### Services Needed:
- **Frontend**: AWS Amplify
- **Backend**: AWS Elastic Beanstalk
- **Database**: MongoDB Atlas (Free tier available)
- **Storage**: S3 (for temp audio files)

### Step-by-Step:

#### 1. Frontend Deployment (Amplify)

```bash
cd frontend
npm run build
```

**In AWS Console:**
1. Go to **AWS Amplify**
2. Click **"New app" → "Host web app"**
3. Connect your Git repository OR drag & drop the `frontend/dist` folder
4. Build settings (auto-detected):
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
   ```
5. Add environment variable:
   - `VITE_API_URL`: Your backend URL (will get this after backend deploy)
6. Deploy!

**Result**: You get a URL like `https://main.d1234abcd.amplifyapp.com`

---

#### 2. Backend Deployment (Elastic Beanstalk)

**Prerequisites:**
- Install AWS CLI: `brew install awscli` (Mac) or download from AWS
- Install EB CLI: `pip install awsebcli`

**Setup:**

```bash
cd backend

# Initialize Elastic Beanstalk
eb init -p "Node.js 18" ai-video-interviewer --region us-east-1

# Create environment
eb create ai-video-interviewer-prod

# Set environment variables
eb setenv \
  OPENAI_API_KEY=your_key \
  LIVEKIT_URL=wss://your-livekit-server.com \
  LIVEKIT_API_KEY=your_key \
  LIVEKIT_API_SECRET=your_secret \
  MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ai_interviewer \
  MONGODB_DB_NAME=ai_interviewer \
  PORT=8080 \
  NODE_ENV=production

# Deploy
eb deploy
```

**Result**: You get a URL like `http://ai-video-interviewer-prod.elasticbeanstalk.com`

**Update Frontend:**
- Go back to Amplify → Environment variables
- Set `VITE_API_URL` to your Elastic Beanstalk URL

---

#### 3. Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster (M0)
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (or your EB IP)
5. Get connection string
6. Update `MONGODB_URI` in Elastic Beanstalk

---

#### 4. S3 for Temp Files (Optional but Recommended)

```bash
# Create S3 bucket
aws s3 mb s3://ai-video-interviewer-temp

# Update backend to use S3 instead of local temp folder
# (We'll need to modify whisper.js)
```

---

## Option 2: Production-Ready Deployment

**Complexity: ⭐⭐⭐⭐ (High)**  
**Cost: ~$100-300/month**  
**Best for: Production, scaling, high availability**

### Services Needed:
- **Frontend**: S3 + CloudFront
- **Backend**: ECS Fargate (Containerized)
- **Database**: MongoDB Atlas (or AWS DocumentDB)
- **Storage**: S3
- **Secrets**: AWS Secrets Manager
- **Load Balancer**: Application Load Balancer

### Step-by-Step:

#### 1. Containerize Backend

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create temp directory
RUN mkdir -p temp

# Expose port
EXPOSE 8080

# Start application
CMD ["node", "server.js"]
```

Create `backend/.dockerignore`:
```
node_modules
temp
.env
*.log
.git
```

#### 2. Build and Push to ECR

```bash
# Create ECR repository
aws ecr create-repository --repository-name ai-video-interviewer

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build image
cd backend
docker build -t ai-video-interviewer-backend .

# Tag image
docker tag ai-video-interviewer-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ai-video-interviewer:latest

# Push image
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ai-video-interviewer:latest
```

#### 3. Create ECS Task Definition

Create `backend/ecs-task-definition.json`:

```json
{
  "family": "ai-video-interviewer",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ai-video-interviewer:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "8080"
        }
      ],
      "secrets": [
        {
          "name": "OPENAI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:ai-video/openai-key"
        },
        {
          "name": "LIVEKIT_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:ai-video/livekit-key"
        },
        {
          "name": "LIVEKIT_API_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:ai-video/livekit-secret"
        },
        {
          "name": "MONGODB_URI",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:ai-video/mongodb-uri"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ai-video-interviewer",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### 4. Deploy to ECS

```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json

# Create cluster
aws ecs create-cluster --cluster-name ai-video-interviewer-cluster

# Create service
aws ecs create-service \
  --cluster ai-video-interviewer-cluster \
  --service-name ai-video-interviewer-service \
  --task-definition ai-video-interviewer \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=8080"
```

#### 5. Frontend on S3 + CloudFront

```bash
cd frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://ai-video-interviewer-frontend --delete

# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name ai-video-interviewer-frontend.s3.amazonaws.com
```

---

## Option 3: Serverless (Advanced)

**Complexity: ⭐⭐⭐⭐⭐ (Very High)**  
**Cost: Pay-per-use**  
**Best for: Auto-scaling, cost optimization**

### Services:
- **Frontend**: S3 + CloudFront
- **Backend**: AWS Lambda + API Gateway
- **Database**: MongoDB Atlas
- **Storage**: S3

**Note**: Requires significant code refactoring to be serverless-compatible.

---

## Quick Comparison

| Option | Complexity | Cost/Month | Scalability | Setup Time |
|--------|-----------|------------|-------------|-------------|
| **Option 1** (Amplify + EB) | ⭐⭐ | $20-50 | Medium | 2-3 hours |
| **Option 2** (ECS + CloudFront) | ⭐⭐⭐⭐ | $100-300 | High | 4-6 hours |
| **Option 3** (Serverless) | ⭐⭐⭐⭐⭐ | Pay-per-use | Very High | 8+ hours |

---

## Recommended: Option 1 (Amplify + Elastic Beanstalk)

### Why?
- ✅ Easiest to set up
- ✅ Managed services (less maintenance)
- ✅ Good for MVP and small-medium scale
- ✅ Can upgrade later if needed

### Step-by-Step Checklist:

#### Frontend (Amplify):
- [ ] Build frontend: `cd frontend && npm run build`
- [ ] Create Amplify app in AWS Console
- [ ] Connect Git repo or upload `dist` folder
- [ ] Set `VITE_API_URL` environment variable
- [ ] Deploy and get URL

#### Backend (Elastic Beanstalk):
- [ ] Install AWS CLI and EB CLI
- [ ] Run `eb init` in backend folder
- [ ] Run `eb create` to create environment
- [ ] Set all environment variables with `eb setenv`
- [ ] Deploy with `eb deploy`
- [ ] Update frontend `VITE_API_URL` with backend URL

#### Database:
- [ ] Create MongoDB Atlas account
- [ ] Create free cluster
- [ ] Create database user
- [ ] Whitelist IPs (0.0.0.0/0 for EB)
- [ ] Get connection string
- [ ] Update `MONGODB_URI` in EB

#### Additional Setup:
- [ ] Create S3 bucket for temp files (optional)
- [ ] Update CORS settings if needed
- [ ] Test end-to-end

---

## Important Considerations

### 1. Environment Variables
Store sensitive keys in:
- **Option 1**: Elastic Beanstalk environment variables
- **Option 2**: AWS Secrets Manager (more secure)

### 2. CORS Configuration
Update backend `server.js`:
```js
app.use(cors({
  origin: ['https://your-amplify-url.amplifyapp.com'],
  credentials: true
}));
```

### 3. File Upload Limits
Elastic Beanstalk default: 10MB
- Increase in `.ebextensions/01-nginx.config`:
```nginx
client_max_body_size 50M;
```

### 4. Temp File Storage
For production, use S3 instead of local temp folder:
- Upload audio to S3
- Process from S3
- Delete after processing

### 5. Monitoring
- CloudWatch for logs
- Set up alarms for errors
- Monitor API response times

---

## Cost Estimation (Option 1)

- **Amplify**: Free tier (5GB storage, 15GB bandwidth)
- **Elastic Beanstalk**: ~$15-30/month (t2.micro instance)
- **MongoDB Atlas**: Free tier (512MB)
- **S3**: ~$1-5/month (for temp files)
- **Data Transfer**: ~$5-10/month

**Total: ~$20-50/month**

---

## Next Steps

1. **Start with Option 1** (Amplify + EB)
2. Test thoroughly
3. Monitor costs and performance
4. Scale up to Option 2 if needed

Would you like me to create the specific configuration files for your chosen option?

