# Deploy to Railway.app (Step-by-Step Guide)

Railway is the easiest and most reliable free option to deploy this Task Graph Backend. Follow these steps:

## Prerequisites
- GitHub account (free)
- Railway account (https://railway.app, sign up with GitHub)
- OpenAI API key (optional — can use mock mode without it)

## Step 1: Push Your Code to GitHub

If your code is not on GitHub yet:

```bash
# Initialize git repo (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Task Graph Backend"

# Create repo on GitHub (https://github.com/new) then:
git remote add origin https://github.com/YOUR_USERNAME/task-graph-backend.git
git branch -M main
git push -u origin main
```

Important: Make sure `.env` is in `.gitignore` (it is in this project).

## Step 2: Connect to Railway

1. Go to https://railway.app
2. Click **New Project**
3. Select **Deploy from GitHub**
4. Authorize Railway to access your GitHub account
5. Select your `task-graph-backend` repository
6. Select `main` branch
7. Click **Deploy**

Railway will detect Node.js and automatically:
- Run `npm install`
- Run `npm run build` (if found in package.json)
- Start your app with `npm start`

## Step 3: Set Environment Variables

After deployment starts (or in project settings):

1. Go to your Railway project
2. Click **Variables** tab
3. Add these variables:

```
LLM_MODE=mock                    # or "openai" if you want real LLM
OPENAI_API_KEY=                  # (Optional) Add your key if using openai mode
PORT=3000                        # (Usually auto-set by Railway, optional)
DATABASE_PATH=/tmp/tasks.db      # Use /tmp for ephemeral storage (recommended)
```

**Note:** If you want to use OpenAI:
- Get your API key from https://platform.openai.com/api-keys
- Paste it in the `OPENAI_API_KEY` variable
- Set `LLM_MODE=openai`

## Step 4: Get Your Public URL

1. In Railway dashboard, go to **Deployments**
2. Look for your latest deployment (green checkmark = success)
3. Click it → you'll see a public URL like:
   ```
   https://task-graph-backend-production.railway.app
   ```

## Step 5: Test Your Deployed App

```bash
# Health check
curl https://task-graph-backend-production.railway.app/health

# Generate tasks (mock mode)
curl -X POST https://task-graph-backend-production.railway.app/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"build a web application with user auth"}'

# List transcripts
curl https://task-graph-backend-production.railway.app/transcripts

# Get tasks from a transcript
curl https://task-graph-backend-production.railway.app/tasks/1
```

## Using OpenAI on Railway (Real LLM instead of Mock)

If you want real LLM responses:

1. Get OpenAI API key:
   - Visit https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Copy the key (save it securely!)

2. In Railway Variables:
   - Set `OPENAI_API_KEY=sk-...` (paste your actual key)
   - Set `LLM_MODE=openai`
   - Click **Save**

3. Railway automatically redeploys with new variables
4. Test: POST to `/generate` and you'll get real LLM responses!

**Cost:** ~$0.001 per request (very cheap for testing/demos)

## Troubleshooting

### App crashes or "502 Bad Gateway"
- Check Logs in Railway dashboard (Deployments → click deployment → Logs)
- Common issue: missing `LLM_MODE` or invalid `OPENAI_API_KEY`

### Data not persisting
- Current app uses JSON file (`./data/tasks.db`)
- Railway's ephemeral filesystem means data is lost on redeploy
- **Solution:** Use `DATABASE_PATH=/tmp/tasks.db` (temporary storage) or add Railway's managed PostgreSQL (free tier available)

### How to add Postgres on Railway (optional, for persistent data)
1. In Railway project, click **+ Create**
2. Select **PostgreSQL**
3. Railway will provision a DB and set `DATABASE_URL` automatically
4. (We can integrate Postgres later if needed — for now, JSON file works)

## Update & Redeploy

To update your app:

```bash
# Make changes locally
# Test: npm run build && npm start

# Commit and push
git add .
git commit -m "Update: description of changes"
git push origin main
```

Railway automatically detects the push and redeploys your app!

## Free Tier Limits

- **$5/month credits** (renewed each month)
- Typical usage: ~$1-2/month for light testing
- Monitor usage in **Billing** tab
- Set alerts if needed

---

**You're done!** Your app is now live at `https://task-graph-backend-production.railway.app` 🎉

Questions? Check Railway docs: https://docs.railway.app
