# Telegram AI Bot Setup Guide

This guide will help you set up and deploy your Telegram AI bot with conversation learning, image generation, and user activity tracking.

## Features

✅ **AI Conversations** - Natural language understanding and responses using Lovable AI (Gemini)  
✅ **Auto Greetings** - Automatic gm/gn responses  
✅ **Image Generation** - Generate images from text prompts using `/generate <prompt>`  
✅ **Conversation Learning** - Stores and learns from all conversations  
✅ **Activity Tracking** - Monitors user engagement and activity  
✅ **Admin Dashboard** - Real-time monitoring and configuration

## Prerequisites

- A Telegram Bot Token (get one from [@BotFather](https://t.me/botfather))
- Lovable Cloud enabled (already set up!)
- Lovable AI enabled (already set up!)

## Setup Steps

### 1. Create Your Telegram Bot

1. Open Telegram and find [@BotFather](https://t.me/botfather)
2. Send `/newbot` and follow the instructions
3. Choose a name and username for your bot
4. Copy the **Bot Token** - you'll need this next

### 2. Configure Your Bot Token

The TELEGRAM_BOT_TOKEN secret has already been created. To update it with your actual bot token:

1. Go to your Lovable Cloud backend settings
2. Navigate to Edge Function Secrets
3. Update the `TELEGRAM_BOT_TOKEN` value with your bot token from BotFather

### 3. Set Up the Webhook

Once deployed, you need to tell Telegram where to send updates. Replace `YOUR_BOT_TOKEN` and `YOUR_PROJECT_ID` with your actual values:

```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://YOUR_PROJECT_ID.supabase.co/functions/v1/telegram-webhook"
```

You can find your project ID in the backend URL or in the config.

### 4. Add Bot to Your Group

1. Add your bot to the Telegram supergroup
2. Make sure to:
   - Give the bot admin permissions (or at least permission to read messages)
   - Disable "Group Privacy" in BotFather settings: `/setprivacy` -> Select your bot -> Disable

### 5. Test Your Bot!

Try these commands in your group:

- Say "gm" or "good morning" - bot will respond
- Say "gn" or "good night" - bot will respond  
- `/generate a beautiful sunset` - bot will generate an image
- Ask any question - bot will have a conversation

## Bot Commands

- `/generate <prompt>` - Generate an image from text
- Natural conversation - Just talk to the bot!
- Automatic gm/gn detection

## Dashboard Features

Access the admin dashboard to:

- View real-time user activity
- See message statistics
- Check engagement metrics
- Monitor conversation quality
- Configure bot settings

## Configuration

Bot settings can be customized in the Configuration tab:

- **System Prompt** - Define bot personality
- **Features** - Enable/disable specific capabilities
- **Auto-responses** - Control gm/gn behavior

## Database

The bot stores:

- **telegram_users** - User profiles and activity metrics
- **messages** - All conversations for learning
- **bot_config** - Bot settings and configuration

## AI Models

The bot uses:

- **Gemini 2.5 Flash** - Fast, conversational AI (FREE during promotion!)
- **Gemini 2.5 Flash Image Preview** - Image generation

## Troubleshooting

### Bot not responding?

1. Check webhook is set correctly
2. Verify bot token is correct
3. Ensure bot has proper group permissions
4. Check Edge Function logs in backend

### Images not generating?

1. Verify Lovable AI is enabled
2. Check credit balance
3. Review generate-image function logs

### Dashboard not updating?

1. Refresh the page
2. Check database RLS policies
3. Verify backend connection

## Support

Need help? Check:

- [Lovable Cloud Docs](https://docs.lovable.dev/features/cloud)
- [Lovable AI Docs](https://docs.lovable.dev/features/ai)
- [Telegram Bot API](https://core.telegram.org/bots/api)

---

Built with ❤️ using Lovable, Telegram, and AI
