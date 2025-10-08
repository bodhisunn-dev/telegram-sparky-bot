#!/bin/bash
# Run the online status sync script periodically

echo "🚀 Starting Telegram Online Status Sync Service"

while true; do
    echo ""
    echo "⏰ Running sync at $(date)"
    python3 sync_online_status.py
    
    # Run every 2 minutes
    echo "😴 Sleeping for 2 minutes..."
    sleep 120
done
