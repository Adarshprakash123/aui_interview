# LiveKit Setup Guide

This guide helps you set up LiveKit for your AI Video Interviewer application.

---

## 🤔 Which Should You Use?

### LiveKit Cloud (Recommended) ✅
- **Best for**: Most users, quick setup, testing
- **Cost**: Free tier (10,000 participant minutes/month) or $99+/month
- **Setup time**: 5 minutes
- **Maintenance**: None (managed by LiveKit)

### Self-Hosted Server
- **Best for**: High traffic, custom requirements, cost control
- **Cost**: Server costs (~$20-50/month)
- **Setup time**: 30-60 minutes
- **Maintenance**: You manage the server

---

## 🚀 Option 1: LiveKit Cloud (Easiest)

### Step 1: Create LiveKit Cloud Account

1. Go to [cloud.livekit.io](https://cloud.livekit.io)
2. Click **"Sign Up"** or **"Get Started"**
3. Sign up with:
   - Email
   - GitHub
   - Google

### Step 2: Create a Project

1. After signing up, click **"Create Project"**
2. Enter project name: `ai-video-interviewer`
3. Choose region closest to your users (e.g., `us-east-1`, `eu-west-1`)
4. Click **"Create"**

### Step 3: Get Your Credentials

1. In your project dashboard, go to **"Settings"** → **"API Keys"**
2. You'll see:
   - **Default API Key** (or create a new one)
   - **API Secret** (click to reveal)
   - **Server URL** (e.g., `wss://your-project.livekit.cloud`)

3. **Copy these three values** - you'll need them for your backend!

### Step 4: Configure Your Backend

Add these environment variables to your backend deployment:

```bash
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=APxxxxxxxxxxxxx
LIVEKIT_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Example:**
```bash
LIVEKIT_URL=wss://ai-interviewer-prod.livekit.cloud
LIVEKIT_API_KEY=APabc123def456
LIVEKIT_API_SECRET=your_livekit_secret_key_here
```

### Step 5: Test Connection

1. Deploy your backend with these environment variables
2. Test the `/api/token/generate` endpoint
3. Your frontend should now connect to LiveKit Cloud!

---

## 🖥️ Option 2: Self-Hosted LiveKit Server

### Prerequisites

- A server/VPS with:
  - Public IP or domain name
  - At least 2GB RAM
  - Docker installed
  - Ports open: 7880, 7881, 7882, 50000-60000 (UDP)

### Step 1: Deploy LiveKit Server with Docker

#### Quick Start (Development)

```bash
# Create a directory
mkdir livekit-server
cd livekit-server

# Create docker-compose.yml
cat > docker-compose.yml << EOF
version: '3.8'

services:
  livekit:
    image: livekit/livekit-server:latest
    ports:
      - "7880:7880"    # HTTP/WebSocket
      - "7881:7881"    # WebRTC TCP
      - "7882:7882/udp"  # WebRTC UDP
      - "50000-60000:50000-60000/udp"  # RTP range
    environment:
      - LIVEKIT_KEYS=your_api_key:your_api_secret
    command: --dev
    restart: unless-stopped
EOF

# Start the server
docker-compose up -d
```

#### Production Setup (with SSL)

For production, you'll need:
1. Domain name pointing to your server
2. SSL certificate (Let's Encrypt recommended)
3. Reverse proxy (nginx or Traefik)

**Example with nginx:**

```yaml
# docker-compose.yml
version: '3.8'

services:
  livekit:
    image: livekit/livekit-server:latest
    ports:
      - "7880:7880"
      - "7881:7881"
      - "7882:7882/udp"
      - "50000-60000:50000-60000/udp"
    environment:
      - LIVEKIT_KEYS=your_api_key:your_api_secret
      - LIVEKIT_CONFIG=/etc/livekit.yaml
    volumes:
      - ./livekit.yaml:/etc/livekit.yaml
    restart: unless-stopped
```

**nginx configuration:**

```nginx
# /etc/nginx/sites-available/livekit
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:7880;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Step 2: Generate API Keys

You can generate keys using LiveKit CLI or manually:

**Using LiveKit CLI:**
```bash
# Install LiveKit CLI
npm install -g livekit-cli

# Generate keys
livekit-cli generate-keys
```

**Or manually:**
- API Key: Any string (e.g., `my-api-key-123`)
- API Secret: Generate a secure random string (32+ characters)

### Step 3: Configure Your Backend

Set these environment variables:

```bash
# For self-hosted without SSL (development only)
LIVEKIT_URL=ws://your-server-ip:7880

# For self-hosted with SSL (production)
LIVEKIT_URL=wss://your-domain.com

LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
```

### Step 4: Test Connection

1. Make sure your server is running
2. Test WebSocket connection:
   ```bash
   curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
     http://your-server:7880
   ```
3. Deploy your backend with the environment variables
4. Test token generation endpoint

---

## 🔍 How to Check Your Current Setup

### Check Environment Variables

Look at your backend's environment variables (in deployment platform or `.env` file):

```bash
# Check what's set
echo $LIVEKIT_URL
echo $LIVEKIT_API_KEY
```

### Identify Which You're Using

- **LiveKit Cloud**: URL contains `.livekit.cloud`
  - Example: `wss://my-project.livekit.cloud`
  
- **Self-hosted**: URL is your own domain/IP
  - Example: `wss://livekit.mydomain.com` or `ws://123.45.67.89:7880`

### Test Your Setup

1. **Test token generation:**
   ```bash
   curl -X POST https://your-backend.com/api/token/generate \
     -H "Content-Type: application/json" \
     -d '{"roomName":"test-room","participantName":"test-user"}'
   ```

2. **Check response:**
   ```json
   {
     "success": true,
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "url": "wss://your-livekit-url"
   }
   ```

3. **Test frontend connection:**
   - Open your frontend
   - Start an interview
   - Check browser console for LiveKit connection logs

---

## 📊 LiveKit Cloud Pricing

### Free Tier
- ✅ 10,000 participant minutes/month
- ✅ Up to 50 concurrent participants
- ✅ All features included
- ✅ Perfect for testing and small apps

### Paid Plans
- **Starter**: $99/month - 100K participant minutes
- **Growth**: $299/month - 500K participant minutes
- **Scale**: Custom pricing

**Note**: Participant minutes = sum of all time participants spend in rooms

---

## 🔧 Troubleshooting

### Issue: "Failed to generate LiveKit token"

**Solution:**
- Check that `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` are set correctly
- Verify the values match your LiveKit Cloud project or self-hosted server

### Issue: "Connection failed" in frontend

**Solution:**
- Verify `LIVEKIT_URL` is correct
- For self-hosted: Check firewall rules (ports 7880, 7881, 7882, 50000-60000)
- For LiveKit Cloud: Check your project is active
- Check browser console for specific error messages

### Issue: "CORS error" or "WebSocket connection failed"

**Solution:**
- Ensure you're using `wss://` (secure) in production, not `ws://`
- For self-hosted: Set up SSL certificate
- Check that your LiveKit server allows connections from your frontend domain

### Issue: "Invalid API key"

**Solution:**
- Regenerate API keys in LiveKit Cloud dashboard
- For self-hosted: Verify `LIVEKIT_KEYS` environment variable matches backend keys
- Make sure there are no extra spaces in environment variables

---

## 🎯 Recommended Setup for Your Project

**For Development/Testing:**
- ✅ Use **LiveKit Cloud Free Tier**
- ✅ Quick setup (5 minutes)
- ✅ No server management
- ✅ Generous free tier

**For Production (Low-Medium Traffic):**
- ✅ Use **LiveKit Cloud Starter Plan** ($99/month)
- ✅ Managed service
- ✅ Reliable and scalable
- ✅ Global edge network

**For Production (High Traffic/Custom Needs):**
- ✅ Consider **Self-Hosted** or **LiveKit Cloud Scale Plan**
- ✅ More control
- ✅ Cost-effective at scale

---

## 📝 Quick Reference

### Environment Variables Needed

```bash
# Required for all setups
LIVEKIT_URL=wss://your-livekit-url
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
```

### LiveKit Cloud URL Format
```
wss://your-project-name.livekit.cloud
```

### Self-Hosted URL Format
```
wss://your-domain.com        # Production (with SSL)
ws://your-ip:7880           # Development only
```

---

## 🆘 Need Help?

- **LiveKit Cloud Docs**: [docs.livekit.io/cloud](https://docs.livekit.io/cloud)
- **Self-Hosting Guide**: [docs.livekit.io/deployment](https://docs.livekit.io/deployment)
- **LiveKit Discord**: [discord.gg/livekit](https://discord.gg/livekit)
- **Support**: support@livekit.io

---

## ✅ Next Steps

1. **Choose your option** (Cloud recommended for most users)
2. **Set up LiveKit** (follow steps above)
3. **Add environment variables** to your backend deployment
4. **Test the connection** using the test steps above
5. **Deploy your backend** with the new environment variables

Once LiveKit is configured, your video interview feature will work! 🎉

