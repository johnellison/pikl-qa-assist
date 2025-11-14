# Railway Deployment Guide for Pikl QA Assist

Quick and easy deployment to Railway with SQLite + persistent file storage.

## Prerequisites

- Railway account (https://railway.app)
- GitHub repository connected to Railway
- API keys for AssemblyAI and Anthropic

## Step 1: Create New Railway Project

1. Log in to Railway: https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `pikl-qa-assist` repository
5. Railway will automatically detect the Next.js app

## Step 2: Configure Environment Variables

In your Railway project, go to **Variables** tab and add:

```bash
# Required API Keys
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
ASSEMBLYAI_API_KEY=xxxxx

# Application Settings
NODE_ENV=production

# Database (SQLite on persistent volume)
DATABASE_URL=file:/app/data/db/qa-assist.db
```

**Important:** Don't set `NEXT_PUBLIC_BASE_URL` manually - Railway will auto-generate the public domain.

## Step 3: Add Persistent Volume for Data Storage

This is **CRITICAL** - without this, your database and files will be lost on every deploy!

**To create a volume:**

1. Open the **Command Palette** with `⌘K` (Mac) or `Ctrl+K` (Windows/Linux)
   - OR right-click on the project canvas
2. Select **"New Volume"**
3. **Select your service** (pikl-qa-assist)
4. Set **Mount Path:** `/app/data`
5. Click **"Add"** or **"Create"**

This volume will persist:
- SQLite database (`/app/data/db/qa-assist.db`)
- Uploaded audio files (`/app/data/uploads/`)
- Transcripts (`/app/data/transcripts/`)
- Analysis results (`/app/data/analyses/`)

## Step 4: Configure Build Settings (Optional)

Railway should auto-detect, but if needed:

1. Go to **Settings** → **Build**
2. Verify:
   - **Builder:** Nixpacks
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`

## Step 5: Deploy

1. Click **"Deploy"** or push to your GitHub repo
2. Railway will automatically:
   - Install dependencies
   - Run Prisma migrations
   - Build Next.js app
   - Start the server

Watch the deployment logs in real-time!

## Step 6: Access Your Application

1. Once deployed, go to **Settings** → **Networking**
2. Click **"Generate Domain"** to get a public URL
3. Your app will be available at: `https://your-app-name.up.railway.app`

## Step 7: Initialize Database (First Deploy Only)

On first deployment, you may need to run Prisma migrations:

1. In Railway project, click **"Deployments"** tab
2. Click on the active deployment
3. Click **"View Logs"**
4. If you see database errors, you may need to run migrations manually

**Option A: Add to package.json (Recommended)**

Update `package.json` build script to include Prisma:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

**Option B: Railway CLI (Advanced)**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run migrations
railway run npx prisma migrate deploy
```

## Environment-Specific Configuration

Railway automatically sets these variables:
- `RAILWAY_ENVIRONMENT` - Current environment (production)
- `RAILWAY_PUBLIC_DOMAIN` - Your public domain
- `PORT` - Port to listen on (Railway manages this)

## Monitoring & Logs

**View Logs:**
1. Go to your Railway project
2. Click **"Deployments"** tab
3. Click on active deployment
4. View real-time logs

**Metrics:**
- CPU usage
- Memory usage
- Network traffic
- Build times

## Updating Your Application

**Automatic Deploys:**
- Push to GitHub → Railway auto-deploys
- Monitor deployment in Railway dashboard

**Manual Redeploy:**
1. Go to **Deployments** tab
2. Click **"Redeploy"** on any deployment

## Volume Management

**Check Volume Usage:**
1. Go to **Settings** → **Volumes**
2. View storage usage and limits

**Backup Data (Recommended):**

```bash
# Using Railway CLI
railway connect
cd /app/data
tar -czf backup.tar.gz db/ uploads/ transcripts/ analyses/
# Download via SFTP or railway volumes
```

## Troubleshooting

### Database Not Found Error

**Issue:** `Error: SQLITE_CANTOPEN: unable to open database file`

**Solution:** Make sure persistent volume is mounted to `/app/data`

### Files Not Persisting After Deploy

**Issue:** Uploaded files disappear after redeploy

**Solution:** Verify volume is configured and mounted correctly

### Build Fails

**Issue:** Build fails with Prisma errors

**Solution:** Add `prisma generate` to build script in package.json

### App Won't Start

**Issue:** App crashes on startup

**Solution:** Check logs for errors. Common issues:
- Missing environment variables
- Database connection errors
- Port conflicts (Railway sets PORT automatically)

## Cost Estimate

**Railway Pricing:**
- **Starter Plan:** $5/month (500 hours execution time)
- **Volume Storage:** ~$0.25/GB/month
- **Bandwidth:** Included

**Expected Monthly Cost:**
- Compute: ~$5-10
- Volume (2GB): ~$0.50
- **Total: ~$5-11/month**

For 90 calls (~250MB data), you'll stay well under 1GB.

## Scaling

**When you need more resources:**
1. Go to **Settings** → **Resources**
2. Increase:
   - vCPU
   - Memory
   - Volume size

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Create issue in your repo

## Next Steps

After successful deployment:
- [ ] Test file upload functionality
- [ ] Verify database persistence across deploys
- [ ] Check audio playback works
- [ ] Test full transcription → analysis pipeline
- [ ] Set up monitoring/alerts
- [ ] Configure custom domain (optional)

---

**Deployment Status:** 🟢 Ready to deploy!

**Estimated Setup Time:** 15-30 minutes
