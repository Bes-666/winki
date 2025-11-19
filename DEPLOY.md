# Deployment Guide for SkillStock

## Prerequisites

1. Netlify account
2. Supabase project
3. Telegram Bot Token from @BotFather

## Step 1: Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Copy and execute the SQL from `supabase/schema.sql`
4. Copy your project URL and anon key from Settings > API

## Step 2: Create Telegram Bot

1. Open Telegram and search for @BotFather
2. Send `/newbot` command
3. Follow instructions to create your bot
4. Copy the bot token

## Step 3: Deploy to Netlify

### Option A: Deploy via Git

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Netlify](https://app.netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables:
   - `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `NEXT_PUBLIC_SUPABASE_URL` - Same as SUPABASE_URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Same as SUPABASE_ANON_KEY
7. Click "Deploy site"

### Option B: Deploy via Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

## Step 4: Setup Telegram Webhook

After deployment, set up the webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://your-app.netlify.app/api/webhook"
```

Or use the Telegram Bot API:

```javascript
const axios = require('axios');

axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`, {
  url: 'https://your-app.netlify.app/api/webhook'
});
```

## Step 5: Verify Deployment

1. Visit your Netlify site URL
2. Test the Telegram bot by sending `/start` command
3. Check Netlify Functions logs for any errors

## Troubleshooting

### Webhook not working
- Check that TELEGRAM_BOT_TOKEN is set correctly
- Verify webhook URL is accessible
- Check Netlify Functions logs

### Database connection issues
- Verify SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Check Supabase project is active
- Verify RLS policies are set correctly

### Build errors
- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check build logs in Netlify dashboard

## Environment Variables Reference

```
TELEGRAM_BOT_TOKEN=your_bot_token_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Security Notes

- Never commit `.env` files
- Use Netlify environment variables for secrets
- Keep SUPABASE_SERVICE_ROLE_KEY secure (server-side only)
- Regularly rotate API keys
- Enable Supabase RLS policies


