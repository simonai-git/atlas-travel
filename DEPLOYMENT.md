# Deployment Guide for Atlas Travel

## GitHub Setup (Manual)

1. Create a new repository at https://github.com/organizations/simonai-git/repositories/new
   - Name: `atlas-travel`
   - Public repository
   - Don't initialize with README (we have one)

2. Push local code:
   ```bash
   cd /Users/simon/clawd/atlas-travel
   git remote set-url origin git@github.com:simonai-git/atlas-travel.git
   git push -u origin main
   ```

## Railway Deployment

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select `simonai-git/atlas-travel`
4. Add PostgreSQL:
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway will auto-inject `DATABASE_URL`
5. Add environment variables:
   - `ANTHROPIC_API_KEY` - Your Claude API key
   - `NEXT_PUBLIC_APP_URL` - Your Railway domain (after first deploy)

## Environment Variables Required

| Variable | Where to get it |
|----------|-----------------|
| `DATABASE_URL` | Auto-provided by Railway PostgreSQL addon |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/api-keys |
| `NEXT_PUBLIC_APP_URL` | Your Railway app URL after deployment |

## Post-Deployment

After Railway deploys:
1. Copy the Railway URL (e.g., `atlas-travel-production.up.railway.app`)
2. Update `NEXT_PUBLIC_APP_URL` in Railway env vars
3. Redeploy for the change to take effect
