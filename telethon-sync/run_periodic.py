#!/usr/bin/env python3
"""
Periodic Member Sync Script
Runs the member sync every N hours continuously
For Railway deployment
"""

import asyncio
import schedule
import time
import sys
from datetime import datetime
from sync_members import main as sync_main

# Force unbuffered output for Railway logs
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

# Configuration
SYNC_INTERVAL_HOURS = 3  # Run every 3 hours

def run_sync():
    """Run the sync task"""
    print(f"\n{'='*60}", flush=True)
    print(f"⏰ Scheduled sync triggered at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", flush=True)
    print(f"{'='*60}\n", flush=True)
    
    try:
        asyncio.run(sync_main())
    except Exception as e:
        print(f"❌ ERROR in sync: {e}", flush=True)
        import traceback
        traceback.print_exc()

def main():
    """Main periodic scheduler"""
    print("🚀 Starting periodic member sync service...", flush=True)
    print(f"⏱️  Sync interval: Every {SYNC_INTERVAL_HOURS} hours", flush=True)
    print(f"🔄 First sync starting now...\n", flush=True)
    
    # Run immediately on startup
    run_sync()
    
    # Schedule periodic runs
    schedule.every(SYNC_INTERVAL_HOURS).hours.do(run_sync)
    
    print(f"\n✅ Scheduler active. Next sync in {SYNC_INTERVAL_HOURS} hours", flush=True)
    print("Press Ctrl+C to stop\n", flush=True)
    
    # Keep running
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    except KeyboardInterrupt:
        print("\n👋 Shutting down gracefully...", flush=True)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}", flush=True)
        import traceback
        traceback.print_exc()
        raise

if __name__ == '__main__':
    main()
