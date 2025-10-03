#!/usr/bin/env python3
"""
Periodic Member Sync Script
Runs the member sync every N hours continuously
"""

import asyncio
import schedule
import time
from datetime import datetime
from sync_members import main as sync_main

# Configuration
SYNC_INTERVAL_HOURS = 3  # Run every 3 hours

def run_sync():
    """Run the sync task"""
    print(f"\n{'='*60}")
    print(f"⏰ Scheduled sync triggered at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")
    
    asyncio.run(sync_main())

def main():
    """Main periodic scheduler"""
    print("🚀 Starting periodic member sync service...")
    print(f"⏱️  Sync interval: Every {SYNC_INTERVAL_HOURS} hours")
    print(f"🔄 First sync starting now...\n")
    
    # Run immediately on startup
    run_sync()
    
    # Schedule periodic runs
    schedule.every(SYNC_INTERVAL_HOURS).hours.do(run_sync)
    
    print(f"\n✅ Scheduler active. Next sync in {SYNC_INTERVAL_HOURS} hours")
    print("Press Ctrl+C to stop\n")
    
    # Keep running
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    except KeyboardInterrupt:
        print("\n👋 Shutting down gracefully...")

if __name__ == '__main__':
    main()
