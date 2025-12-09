#!/bin/bash

# Quick launcher for extreme DDoS attack
# Usage: ./launch_extreme_attack.sh [target_url]

TARGET=${1:-http://localhost:3000}

echo "💥💥💥 LAUNCHING EXTREME DDOS ATTACK 💥💥💥"
echo "Target: $TARGET"
echo ""
echo "This attack will:"
echo "  - Use 16 workers"
echo "  - Send 1600 requests/second"
echo "  - Create 50MB memory leaks every 10 requests"
echo "  - Force crash at 500MB memory or 800 requests"
echo ""
read -p "Press ENTER to start attack or Ctrl+C to cancel..."

export TARGET_URL=$TARGET
node extreme_ddos_attack.js
