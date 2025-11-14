# 🌐 Ubuntu Server Deployment Guide

## 📋 **Your Server Configuration**

- **Ubuntu Server IP**: `192.168.8.104`
- **Chess Game**: `http://192.168.8.104:3000`
- **Network**: All devices on `192.168.8.x` can access

## 🚀 **Quick Setup on Ubuntu**

### **1. Clone and Setup:**
```bash
# Clone repository
git clone https://github.com/Pathum-Vimukthi-Kumara/Real-time-chess-Game.git
cd Real-time-chess-Game

# Run automated setup script
chmod +x ubuntu_setup.sh
./ubuntu_setup.sh
```

### **2. Start Services:**
```bash
# Terminal 1 - Start Chess Server
cd chess
npm start

# Terminal 2 - Launch DDoS Attack  
npm run attack
```

## 🌍 **Access from Any Device**

### **From Ubuntu Server:**
- `http://localhost:3000`
- `http://192.168.8.104:3000`

### **From Other Devices on Network:**
- **Windows PC**: `http://192.168.8.104:3000`
- **Mac**: `http://192.168.8.104:3000`
- **Phone/Tablet**: `http://192.168.8.104:3000`
- **Other Laptops**: `http://192.168.8.104:3000`

## 📱 **Demo from Multiple Devices**

1. **Start server** on Ubuntu: `cd chess && npm start`
2. **Open chess game** on phone/laptop: `http://192.168.8.104:3000`
3. **Launch attack** from Ubuntu: `npm run attack`
4. **Watch real-time crash** on all connected devices!

## 🔥 **Files Updated for Your IP**

✅ **Server**: `chess/server.js` - Listens on `0.0.0.0:3000`  
✅ **Frontend**: `chess/public/script.js` - Connects to `192.168.8.104:3000`  
✅ **Attack**: `ddos_simulator.js` - Targets `192.168.8.104:3000`  
✅ **Environment**: `chess/.env` - HOST=0.0.0.0

## 🛡️ **Firewall Status**

Port 3000 is now open for external access:
```bash
sudo ufw status
# Should show: 3000 ALLOW
```

## 🎯 **Perfect Demo Setup**

1. **Audience connects** to chess game on phones/laptops
2. **You launch attack** from server terminal  
3. **Everyone sees** real-time crash notification
4. **Demonstrates** DDoS impact on live users

## ⚡ **Manual Commands**

If setup script fails, run manually:
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Open firewall
sudo ufw allow 3000
sudo ufw enable

# Install dependencies
cd chess && npm install
cd .. && npm install
```

Your demo is now configured for network access! 🎉