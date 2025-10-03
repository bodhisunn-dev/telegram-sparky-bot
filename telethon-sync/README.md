# Telegram Member Sync Service

This Python service uses Telethon to fetch all members from your Telegram supergroup and sync them to your Supabase database.

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd telethon-sync
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
nano .env  # or use your preferred editor
```

Required variables:
- `TELEGRAM_API_ID` - Already set (28077951)
- `TELEGRAM_API_HASH` - Already set (17d0f93abcccfd735df0fe79258156e0)
- `TELEGRAM_BOT_TOKEN` - Your bot token from @BotFather
- `TELEGRAM_CHAT_ID` - Your chat ID (e.g., -1002342027931)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (NOT the anon key)

### 3. Run the Sync

#### One-time sync:
```bash
python sync_members.py
```

#### Continuous periodic sync (every 3 hours):
```bash
python run_periodic.py
```

## Deployment Options

### Option 1: VPS/Cloud Server
Deploy to any VPS (DigitalOcean, AWS EC2, Linode, etc.):

```bash
# Upload files
scp -r telethon-sync user@your-server:/path/to/app

# SSH into server
ssh user@your-server

# Install dependencies
cd /path/to/app
pip install -r requirements.txt

# Run with screen or tmux
screen -S telegram-sync
python run_periodic.py
# Ctrl+A, D to detach
```

### Option 2: Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "run_periodic.py"]
```

Build and run:
```bash
docker build -t telegram-sync .
docker run -d --name telegram-sync --env-file .env telegram-sync
```

### Option 3: Railway.app

1. Create a new project on Railway
2. Connect your GitHub repo
3. Add environment variables in Railway dashboard
4. Railway will auto-deploy

### Option 4: Heroku

```bash
heroku create your-app-name
heroku config:set TELEGRAM_API_ID=28077951
heroku config:set TELEGRAM_API_HASH=17d0f93abcccfd735df0fe79258156e0
# ... set other env vars
git push heroku main
```

## How It Works

1. **Telethon Client** connects to Telegram using your API credentials
2. **Fetches all members** from the specified supergroup (even inactive users)
3. **Syncs to Supabase** by upserting to the `telegram_users` table
4. Your existing **mention-users Edge Function** then works with the full member list

## Features

- ✅ Fetches ALL supergroup members (not just active ones)
- ✅ Handles large groups (800+ members)
- ✅ Batch processing for efficient database updates
- ✅ Progress indicators during sync
- ✅ Automatic periodic sync
- ✅ Error handling and logging

## Monitoring

Check logs to see sync progress:
```bash
# If running in screen/tmux
screen -r telegram-sync

# If running as systemd service
journalctl -u telegram-sync -f

# If running in Docker
docker logs -f telegram-sync
```

## Troubleshooting

### "Could not find the input entity"
- Make sure your bot is a member of the group
- Verify the CHAT_ID is correct (should be negative for supergroups)

### "Phone number required"
- You're using bot authentication (BOT_TOKEN), not phone auth
- Make sure BOT_TOKEN is set correctly

### Rate limiting
- Telethon handles rate limits automatically
- Large groups may take a few minutes to sync

## Notes

- First sync will create a `bot_session.session` file (keep this safe)
- The sync respects Telegram's rate limits automatically
- Members without usernames can still be synced (stored with null username)
- Your mention-users function will automatically use the updated member list
