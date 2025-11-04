# Deployment Guide

This guide covers deploying ImperiumIdle for testing and production.

## Pre-Steam Testing Deployment

### Option 1: Railway.app (Easiest - Recommended)

**Why**: Free tier, easy setup, auto-deploys from GitHub

**Steps**:
1. Push your code to GitHub
2. Go to https://railway.app
3. Sign up with GitHub
4. Click "New Project" → "Deploy from GitHub repo"
5. Select your repository
6. Railway auto-detects Node.js
7. Set environment variables:
   - `PORT=5000` (or Railway's assigned port)
   - `MONGODB_URI=your-connection-string`
   - `FRONTEND_URL=https://your-app.railway.app` (if using custom domain)
8. Railway will build and deploy automatically
9. Get your app URL (e.g., `https://imperiumidle.railway.app`)

**Frontend Deployment**:
- Railway can deploy both backend and frontend
- Or use Netlify/Vercel for frontend (static hosting)

---

### Option 2: Render.com

**Steps**:
1. Push code to GitHub
2. Go to https://render.com
3. Sign up with GitHub
4. New → Web Service
5. Connect repository
6. Settings:
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
   - Environment: Node
7. Add environment variables
8. Deploy

---

### Option 3: Self-Hosted VPS

**Recommended for**: Full control, learning experience

**Requirements**:
- VPS (DigitalOcean, Linode, AWS EC2)
- Basic Linux knowledge

**Steps**:
1. SSH into your VPS
2. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
3. Install MongoDB (or use MongoDB Atlas)
4. Install PM2 (process manager):
   ```bash
   sudo npm install -g pm2
   ```
5. Clone your repository:
   ```bash
   git clone https://github.com/yourusername/imperiumidle.git
   cd imperiumidle
   ```
6. Install dependencies:
   ```bash
   npm run install:all
   ```
7. Create `.env` file in backend folder
8. Build backend:
   ```bash
   cd backend
   npm run build
   ```
9. Start with PM2:
   ```bash
   pm2 start dist/server.js --name imperiumidle-backend
   pm2 save
   pm2 startup  # Follow instructions to enable on boot
   ```
10. Configure firewall:
    ```bash
    sudo ufw allow 5000/tcp
    ```
11. Set up Nginx reverse proxy (recommended):
    - Install Nginx
    - Configure to proxy to localhost:5000
    - Set up SSL with Let's Encrypt

**Frontend**:
- Build: `cd frontend && npm run build`
- Serve with Nginx or deploy to Netlify/Vercel

---

### Option 4: Temporary Testing with ngrok

**Best for**: Quick testing with friends

**Steps**:
1. Install ngrok: https://ngrok.com/download
2. Start your backend: `cd backend && npm run dev`
3. In new terminal: `ngrok http 5000`
4. Share the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Update frontend to use ngrok URL

**Note**: Free ngrok URLs change each restart. Paid plans have static URLs.

---

## Frontend Deployment

### Option 1: Netlify (Recommended)

1. Build frontend: `cd frontend && npm run build`
2. Go to https://netlify.com
3. Drag `frontend/dist` folder to Netlify
4. Or connect GitHub for auto-deploy
5. Update API URL in frontend code to point to backend

### Option 2: Vercel

1. Go to https://vercel.com
2. Import GitHub repository
3. Set root directory to `frontend`
4. Build command: `npm run build`
5. Output directory: `dist`

---

## Environment Configuration for Deployment

### Backend .env (Production)

```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=strong-random-secret-key-here
```

### Frontend Configuration

Update `frontend/src/services/socketService.ts` and API calls to use production URL:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'https://your-backend.railway.app'
```

Create `frontend/.env.production`:
```
VITE_API_URL=https://your-backend.railway.app
```

---

## Steam Deployment (Future)

### Preparing for Steam

1. **Steamworks SDK Setup**:
   - Download Steamworks SDK from Steam
   - Integrate into Electron app
   - Implement Steam authentication

2. **Build Configuration**:
   - Build Electron app: `cd electron && npm run build:win`
   - Test .exe thoroughly
   - Create installer (NSIS included)

3. **Steam Store Page**:
   - Create Steam partner account
   - Set up store page
   - Upload screenshots, trailers
   - Configure pricing

4. **Steam Build**:
   - Use SteamCMD or Steamworks SDK
   - Upload build to Steam
   - Configure depots
   - Set up automatic updates

### Electron + Steam Integration

- Electron app can include Steamworks SDK
- Handle Steam authentication
- Use Steam API for achievements, leaderboards
- Steam client handles app updates

---

## Testing Multiplayer Before Steam

### Phase 1: Local Testing
- Multiple browser tabs/windows
- Same network (multiple computers)

### Phase 2: Cloud Testing
- Deploy to Railway/Render
- Share URL with friends
- Test all multiplayer features
- Collect feedback

### Phase 3: Beta Testing
- Deploy to production server
- Invite beta testers
- Test Steam integration
- Fix issues before launch

---

## Monitoring & Maintenance

### Recommended Tools

1. **Application Monitoring**:
   - PM2 (for self-hosted)
   - Railway/Render built-in monitoring
   - New Relic / Datadog (advanced)

2. **Error Tracking**:
   - Sentry.io
   - LogRocket

3. **Database Monitoring**:
   - MongoDB Atlas monitoring (if using)
   - MongoDB Compass (local)

4. **Uptime Monitoring**:
   - UptimeRobot (free)
   - Pingdom

---

## Security Checklist

- [ ] Use HTTPS (SSL certificates)
- [ ] Strong JWT secrets
- [ ] Rate limiting on API
- [ ] Input validation
- [ ] CORS properly configured
- [ ] Database credentials secured
- [ ] Regular backups
- [ ] DDoS protection (if needed)
- [ ] Keep dependencies updated

---

## Backup Strategy

1. **Database Backups**:
   - MongoDB Atlas: Automatic backups
   - Self-hosted: Regular `mongodump` scripts

2. **Code Backups**:
   - GitHub (version control)
   - Regular commits

3. **Configuration Backups**:
   - Store .env examples (without secrets)
   - Document all configurations

---

## Cost Estimation

### Free Tier Options:
- Railway: 500 hours/month free
- Render: Free tier available
- MongoDB Atlas: 512MB free
- Netlify/Vercel: Generous free tier

### Paid (Production):
- VPS: $5-10/month (DigitalOcean)
- MongoDB Atlas: $0-9/month (starter)
- Domain: $10-15/year
- SSL: Free (Let's Encrypt)

### Steam:
- $100 one-time fee for Steam Direct
- Revenue share: ~30% to Steam

---

## Next Steps

1. Choose deployment option
2. Set up backend deployment
3. Set up frontend deployment
4. Test multiplayer features
5. Prepare for Steam integration
6. Launch!

