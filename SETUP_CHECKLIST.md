# Setup Checklist for Telegram Bot

## ✅ Completed Setup

### Backend (Supabase/Lovable Cloud)
- [x] Database tables created (telegram_users, messages, bot_config, user_mentions, posted_facts)
- [x] RLS policies configured
- [x] Edge functions deployed:
  - telegram-webhook
  - chat-ai
  - generate-image
  - remix-image
  - post-random-facts
  - engage-users
  - mention-users
- [x] Cron jobs scheduled:
  - engage-users: Every 5 minutes
  - post-random-facts: Every 10 minutes with duplicate prevention
  - mention-users: Every 30 minutes with hourly duplicate prevention

### Secrets Configured
- [x] TELEGRAM_BOT_TOKEN
- [x] TELEGRAM_API_ID (28077951)
- [x] TELEGRAM_API_HASH
- [x] SUPABASE_URL
- [x] SUPABASE_SERVICE_ROLE_KEY
- [x] LOVABLE_API_KEY (auto-configured)

## 🔄 Pending Setup

### Telethon Sync Service (For Full Member Access)
This Python service fetches ALL 800+ members from your Telegram supergroup.

**Location**: `telethon-sync/` folder

**Steps**:
1. **Choose a deployment option**:
   - VPS/Cloud server (DigitalOcean, AWS, Linode, etc.)
   - Docker container
   - Railway.app
   - Heroku

2. **Install dependencies**:
   ```bash
   cd telethon-sync
   pip install -r requirements.txt
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env and add:
   # - Your Telegram bot token (from @BotFather)
   # - Your Supabase service role key
   ```

4. **Run the service**:
   - One-time sync: `python sync_members.py`
   - Continuous (every 3 hours): `python run_periodic.py`

5. **Verify sync working**:
   - Check terminal output for member count
   - Verify database has all users: Check dashboard "Total Users"
   - Should see 800+ users instead of just ~10

### What Happens After Telethon Sync
- The `mention-users` edge function will automatically use all synced members
- Bot will cycle through ALL 800+ members, not just active ones
- No duplicate mentions within 1 hour
- Runs every 30 minutes mentioning 5-10 random users

## 📊 Dashboard Metrics (Fixed!)

### Now Tracking Correctly:
- ✅ **Total Users**: All users from telegram_users table
- ✅ **Messages Today**: Messages since midnight
- ✅ **Active Conversations**: Users active in last 24h
- ✅ **Images Generated**: Now properly tracked! (Fixed: bot messages are now stored)

### Image Generation Tracking Fix
**Before**: Bot sent "Generating image..." but didn't store it → dashboard showed 0 or wrong count
**After**: Bot stores both the status message and success message → accurate counting

## 🤖 Bot Commands Available

| Command | Description |
|---------|-------------|
| `/generate <prompt>` | Generate AI image |
| `/remix <description>` | Remix uploaded image (attach photo) |
| `/top` | Show leaderboard |
| `/x` | Show recent Twitter raid links |
| `/pinned` | Show pinned messages |
| `gm` / `gn` | Auto-responses (if enabled) |

## 🔍 Monitoring & Debugging

### Check Edge Function Logs
```bash
# Via Lovable: Click "View Backend" in chat
# Or directly check logs for each function
```

### Check Cron Jobs Running
```sql
-- In Supabase SQL editor
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 20;
```

### Verify Telethon Sync
```bash
# In your telethon-sync directory
python sync_members.py
# Should show: "Found XXX total members (excluding bots)"
```

## 🚨 Common Issues & Fixes

### Issue: Images not being counted
**Status**: ✅ FIXED - Bot now stores generation messages

### Issue: Only 10 users being mentioned
**Status**: ⏳ PENDING - Deploy Telethon sync to fetch all 800+ members

### Issue: Facts repeating
**Status**: ✅ FIXED - 7-day duplicate prevention enabled

### Issue: Bot not responding
**Check**:
1. Webhook URL set correctly in Telegram?
2. Edge functions deployed?
3. Secrets configured?
4. Check function logs for errors

## 📝 Notes

- **Bot API Limitation**: Standard Telegram Bot API can't fetch all supergroup members
- **Solution**: Telethon uses MTProto (Telegram Client API) to access full member list
- **Security**: Keep .env and bot_session.session files secure
- **Rate Limits**: Telethon automatically handles Telegram rate limits
- **Deployment**: Once Telethon sync runs, mention-users function works automatically

## 📚 Documentation Links

- [Telethon Setup Guide](telethon-sync/README.md)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Client API (MTProto)](https://core.telegram.org/api)
