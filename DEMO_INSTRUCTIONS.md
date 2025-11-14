# 🚨 DDoS Attack Demo - Real-time Server Crash Detection

## 🎯 What's New

I've enhanced the chess frontend to show **real-time server crash notifications** when the DDoS attack takes down the server.

## 🔥 Demo Steps

### 1. Start the Chess Server
```bash
cd chess
npm start
```
The server runs on `http://localhost:3000`

### 2. Open the Website
- Open `http://localhost:3000` in your browser
- Notice the **green connection indicator** in the header: 🟢 Connected

### 3. Launch DDoS Attack
```bash
# In new terminal
cd D:\basic_network_security\gameapp
npm install
npm run attack
```

## 💥 Real-time Crash Experience

### Before Attack:
- **Header Status**: 🟢 Connected
- **Website**: Fully functional
- **Connection**: Stable

### During Attack:
- **Header Status**: 🟡 Reconnecting...
- **Connection attempts**: Multiple retry attempts
- **Performance**: Website becomes slow/unresponsive

### When Server Crashes:
- **🚨 Full-Screen Alert Appears**:
  ```
  ⚠️ Server Crashed!
  The chess server has stopped responding. 
  This could be due to a DDoS attack or server overload.
  
  Status: Disconnected
  Last response: 15s ago
  
  [Retry Connection]
  ```

- **Header Status**: 🔴 Disconnected
- **Audio Alert**: Error sound plays
- **Visual**: Red warning overlay with shake animation

### Attack Terminal Shows:
```
🔥 DDoS Attack Simulator Starting...
🌊 Starting HTTP Request Flood...
⚡ Starting Socket Connection Flood...
💾 Starting Memory Exhaustion Attack...
💥 All attack vectors launched!
❌ HTTP Errors: 500+
🎯 SERVER APPEARS TO BE DOWN - Attack Successful!
```

## 🎬 Visual Features

1. **Connection Indicator**: Live status in header
2. **Crash Overlay**: Full-screen notification when server dies
3. **Sound Alert**: Audio notification of server crash
4. **Real-time Updates**: Status updates every second
5. **Retry Button**: Attempt to reconnect to server

## 🔧 Recovery

1. **Stop the attack**: Ctrl+C in attack terminal
2. **Restart server**: `cd chess && npm start`
3. **Refresh browser**: Page automatically reconnects
4. **Status returns**: 🟢 Connected

## 🎯 Educational Value

This demo shows:
- **Real user impact** of DDoS attacks
- **How quickly** servers can become unresponsive
- **User experience** during server outages
- **Need for DDoS protection** in production

Perfect for demonstrating cybersecurity vulnerabilities!