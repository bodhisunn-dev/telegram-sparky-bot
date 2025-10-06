# Telegram Member Sync Service

This Python service uses Telethon to fetch all members from your Telegram supergroup and sync them to your Supabase database.

**IMPORTANT**: This service uses **user account authentication** (not bot authentication) to access the full member list of your supergroup. Bots can only see members who recently interacted with the chat, but user accounts can see all members.

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
- `TELEGRAM_PHONE_NUMBER` - **YOUR phone number with country code** (e.g., +12345678900)
  - This must be a phone number that's a member of the supergroup
  - Used for user authentication to access all members
- `TELEGRAM_CHAT_ID` - Your supergroup chat ID (e.g., -1002342027931)
  - Find this in your Supabase `messages` table - look at any `chat_id` value
- `SUPABASE_URL` - Already set (https://eptbjrnqydvkkplousle.supabase.co)
- `SUPABASE_SERVICE_ROLE_KEY` - **IMPORTANT**: Get from Lovable
  - Click "View Backend" button in this chat
  - Go to Settings → API
  - Copy the `service_role` key (NOT the `anon` key!)

### 3. First-Time Authentication

The first time you run the script, Telegram will send a verification code to your phone:

```bash
python sync_members.py
```

You'll see:
```
Please enter the code you received: _____
```

Enter the code from your Telegram app. This creates a session file that's reused for future syncs.

### 4. Run the Sync
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

1. **User Authentication** - Uses your phone number to authenticate (required to see all members)
2. **Telethon Client** connects to Telegram using your API credentials
3. **Fetches all members** from the specified supergroup (including inactive users)
4. **Syncs to Supabase** by upserting to the `telegram_users` table
5. Your existing **mention-users Edge Function** then works with the full member list

## Why User Authentication?

- **Bot accounts** can only see ~50-100 members who recently interacted
- **User accounts** can see all 800+ members in the supergroup
- Your phone number must be a member of the group
- Authentication happens once, then a session file is saved

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
- Make sure your phone number is a member of the group
- Verify the CHAT_ID is correct (should be negative for supergroups)

### "Phone number required" or verification code issues
- Make sure TELEGRAM_PHONE_NUMBER is set with country code (e.g., +12345678900)
- Enter the verification code from Telegram when prompted
- The session file (user_session.session) will be created after first login

### Only seeing 31 users instead of 800+
- **This means you're still using bot authentication**
- Make sure you updated Railway environment variables:
  - Remove `TELEGRAM_BOT_TOKEN`
  - Add `TELEGRAM_PHONE_NUMBER`
- Redeploy the Railway service
- Complete the phone verification when it first runs

### Rate limiting
- Telethon handles rate limits automatically
- Large groups may take a few minutes to sync

## Notes

- First sync requires phone verification and creates a `user_session.session` file (keep this safe!)
- The sync respects Telegram's rate limits automatically
- Members without usernames can still be synced (stored with null username)
- Your mention-users function will automatically use the updated member list
- Session file allows future syncs without re-authentication
