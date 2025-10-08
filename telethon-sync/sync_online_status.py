#!/usr/bin/env python3
"""
Telegram Online Status Sync Script
Fetches actual online status from Telegram and syncs to Supabase
REQUIRES: User account authentication to access online status
"""

import os
import asyncio
from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.tl.types import User, UserStatusOnline, UserStatusOffline, UserStatusRecently
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime, timezone

# Load environment variables
load_dotenv()

# Telegram API credentials
API_ID = int(os.getenv('TELEGRAM_API_ID'))
API_HASH = os.getenv('TELEGRAM_API_HASH')
PHONE_NUMBER = os.getenv('TELEGRAM_PHONE_NUMBER')
CHAT_ID = int(os.getenv('TELEGRAM_CHAT_ID'))
SESSION_STRING = os.getenv('TELEGRAM_SESSION_STRING', '')

# Supabase credentials
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Initialize Telethon client
if SESSION_STRING:
    print("🔑 Using session string from environment variable")
    client = TelegramClient(StringSession(SESSION_STRING), API_ID, API_HASH)
else:
    print("📁 Using file-based session (will require authentication)")
    client = TelegramClient('user_session', API_ID, API_HASH)


async def fetch_online_status():
    """Fetch online status for all members in the chat"""
    print(f"📥 Fetching online status from chat {CHAT_ID}...")
    
    online_users = []
    offline_users = []
    
    async for user in client.iter_participants(CHAT_ID, aggressive=True):
        if isinstance(user, User) and not user.bot:
            is_online = False
            
            # Check user status
            if isinstance(user.status, UserStatusOnline):
                is_online = True
            elif isinstance(user.status, UserStatusRecently):
                # Consider "recently" as online (within last 5 minutes)
                is_online = True
            
            user_data = {
                'telegram_id': user.id,
                'is_online': is_online,
                'online_status_updated_at': datetime.now(timezone.utc).isoformat(),
            }
            
            if is_online:
                online_users.append(user_data)
            else:
                offline_users.append(user_data)
    
    print(f"✅ Found {len(online_users)} online users, {len(offline_users)} offline users")
    return online_users + offline_users


async def sync_to_supabase(users):
    """Sync online status to Supabase database"""
    print(f"\n💾 Syncing online status for {len(users)} users to Supabase...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Update each user's online status
    batch_size = 50
    total_synced = 0
    
    for i in range(0, len(users), batch_size):
        batch = users[i:i + batch_size]
        
        try:
            # Update each user individually
            for user in batch:
                supabase.table('telegram_users').update({
                    'is_online': user['is_online'],
                    'online_status_updated_at': user['online_status_updated_at']
                }).eq('telegram_id', user['telegram_id']).execute()
                
                total_synced += 1
            
            print(f"  ✅ Synced {total_synced}/{len(users)} users")
            
        except Exception as e:
            print(f"  ❌ Error syncing batch: {e}")
            continue
    
    print(f"✅ Sync complete! {total_synced} users updated")


async def main():
    """Main function"""
    print("=" * 60)
    print("🟢 TELEGRAM ONLINE STATUS SYNC")
    print("=" * 60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    try:
        # Connect to Telegram
        print(f"🔄 Connecting to Telegram...")
        await client.start(phone=PHONE_NUMBER)
        print(f"✅ Connected to Telegram")
        
        # Fetch online status
        users = await fetch_online_status()
        
        if not users:
            print("⚠️ No users found")
            return
        
        # Sync to Supabase
        await sync_to_supabase(users)
        
        print("\n" + "=" * 60)
        print(f"✅ ALL DONE! Synced at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        await client.disconnect()


if __name__ == '__main__':
    asyncio.run(main())
