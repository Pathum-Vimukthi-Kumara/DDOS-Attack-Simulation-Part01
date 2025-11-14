#!/bin/bash

# Ubuntu Server Setup Script for Chess DDoS Demo
# This script configures the server for your Ubuntu IP: 192.168.8.104

echo "🚀 Setting up Chess DDoS Demo on Ubuntu Server..."
echo "🌐 Server IP: 192.168.8.104"
echo ""

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
echo "📦 Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git (if not already installed)
echo "📦 Installing Git..."
sudo apt install git -y

# Configure firewall
echo "🛡️ Configuring firewall..."
sudo ufw allow 3000
sudo ufw --force enable

# Create environment file with server settings
echo "⚙️ Creating environment configuration..."
cat > chess/.env << EOF
# Server Configuration
HOST=0.0.0.0
PORT=3000

# MySQL (Clever Cloud)
MYSQL_HOST=bftunyykn1c78toq6a28-mysql.services.clever-cloud.com
MYSQL_USER=uamz8smba00lcvqb
MYSQL_PASSWORD=nzkj5p0fL2FOJq0Tj2BG
MYSQL_DB=bftunyykn1c78toq6a28

# Email (disabled)
EMAIL_USER=
EMAIL_PASS=
EOF

# Install dependencies
echo "📦 Installing project dependencies..."
cd chess && npm install
cd .. && npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the demo:"
echo "1. Start server: cd chess && npm start"
echo "2. Launch attack: npm run attack"
echo "3. Open browser: http://192.168.8.104:3000"
echo ""
echo "🔥 Server will be accessible from any device on your network!"
echo "📱 Try it from your phone or other computers on the same network"