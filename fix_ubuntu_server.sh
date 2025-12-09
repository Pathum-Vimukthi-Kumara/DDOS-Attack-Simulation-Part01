#!/bin/bash

# Fix script for Ubuntu server.js syntax error
# Run this on your Ubuntu/Kali machine

echo "🔧 Fixing server.js syntax error on Ubuntu..."

cd ~/Desktop/DDOS-Attack-Simulation-Part01/chess

# Backup current file
cp server.js server.js.backup 2>/dev/null

# Check line 98 for the error
echo "📋 Checking line 98..."
sed -n '95,100p' server.js

# The error is likely a missing opening for app.use
# Let's check if trackRequest function exists
if ! grep -q "function trackRequest" server.js; then
    echo "❌ Missing trackRequest function - this is a major issue"
    echo "⚠️  Recommendation: Re-clone the repository or pull from correct source"
    exit 1
fi

# Check for the middleware that should be around line 50-100
if ! grep -q "app.use((req, res, next) => {" server.js; then
    echo "❌ Missing middleware declaration"
    echo "🔄 This file seems corrupted or from wrong version"
    echo ""
    echo "✅ SOLUTION: Pull the correct chess folder from git"
    echo ""
    echo "Run these commands:"
    echo "  cd ~/Desktop/DDOS-Attack-Simulation-Part01"
    echo "  git fetch origin"
    echo "  git checkout origin/master -- chess/server.js"
    echo "  cd chess"
    echo "  npm start"
    exit 1
fi

echo "✅ File structure looks OK"
echo "🔄 Try running: git checkout origin/master -- chess/server.js"
