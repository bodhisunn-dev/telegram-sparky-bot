#!/usr/bin/env python3
"""
Telegram Member Sync Script
Fetches all members from a Telegram supergroup and syncs them to Supabase
"""

import os
import asyncio
from telethon import TelegramClient
from telethon.tl.types import User
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime

# Load environment variables
load_dotenv()

# Telegram API credentials
API_ID = int(os.getenv('TELEGRAM_API_ID'))
API_HASH = os.getenv('TELEGRAM_API_HASH')
BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
CHAT_ID = int(os.getenv('TELEGRAM_CHAT_ID'))

# Supabase credentials
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Initialize Telethon client
client = TelegramClient('bot_session', API_ID, API_HASH)


async def fetch_all_members():
    """Fetch all members from the Telegram chat"""
    print(f"📥 Fetching members from chat {CHAT_ID}...")
    
    # Get all participants
    members = []
    async for user in client.iter_participants(CHAT_ID, aggressive=True):
        if isinstance(user, User) and not user.bot:
            member_data = {
                'telegram_id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
            members.append(member_data)
            
            # Print progress every 100 users
            if len(members) % 100 == 0:
                print(f"  📊 Fetched {len(members)} members so far...")
    
    print(f"✅ Found {len(members)} total members (excluding bots)")
    return members


async def sync_to_supabase(members):
    """Sync members to Supabase database"""
    print(f"\n💾 Syncing {len(members)} members to Supabase...")
    
    # Initialize Supabase client here to avoid import-time errors
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Batch upsert in chunks of 100
    batch_size = 100
    total_synced = 0
    
    for i in range(0, len(members), batch_size):
        batch = members[i:i + batch_size]
        
        try:
            # Upsert batch
            result = supabase.table('telegram_users').upsert(
                batch,
                on_conflict='telegram_id'
            ).execute()
            
            total_synced += len(batch)
            print(f"  ✅ Synced {total_synced}/{len(members)} members")
            
        except Exception as e:
            print(f"  ❌ Error syncing batch: {e}")
            continue
    
    print(f"✅ Sync complete! {total_synced} members synced to database")


async def get_chat_info():
    """Get information about the chat"""
    try:
        entity = await client.get_entity(CHAT_ID)
        print(f"\n📊 Chat Information:")
        print(f"  Name: {entity.title}")
        print(f"  ID: {entity.id}")
        print(f"  Type: {'Forum' if getattr(entity, 'forum', False) else 'Regular'} Supergroup")
        return entity
    except Exception as e:
        print(f"❌ Error getting chat info: {e}")
        return None


async def main():
    """Main function"""
    print("=" * 60)
    print("🤖 TELEGRAM MEMBER SYNC SCRIPT")
    print("=" * 60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    try:
        # Connect to Telegram first
        print(f"🔄 Connecting to Telegram...")
        await client.start(bot_token=BOT_TOKEN)
        print(f"✅ Connected to Telegram as bot")
        
        # Get chat info
        await get_chat_info()
        
        # Fetch all members
        members = await fetch_all_members()
        
        if not members:
            print("⚠️ No members found to sync")
            return
        
        # Sync to Supabase
        await sync_to_supabase(members)
        
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
