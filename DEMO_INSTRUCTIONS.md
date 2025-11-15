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

### 2.1 Play the Game (Single Player / Vs Computer)
1. On the home page click a gamemode toggle.
2. For Player vs Computer select skill level & thinking time, then choose a color or Random.
3. The spinner disappears once the engine loads (usually <2s). You can then move pieces.

### 2.2 Multiplayer (Direct Link)
1. Click Create Room and choose time, rated/casual, public/private, and color.
2. You will be shown a waiting panel with a share link. Copy or share the generated URL containing `?r=<roomId>`.
3. Second player opens that URL and joins automatically.
4. Game starts when both colors connected.

### 2.3 Multiplayer (Matchmaking)
1. Click Find Game to enter the queue.
2. When a match is found the page reloads with `?r=<roomId>`.
3. Wait briefly; board loads, timers appear, and white starts.

### 2.4 Spectator
Open any room URL after a game already started; if both seats filled you will see timers and moves but cannot interact.

### 2.5 Account / Rating
Optional: Sign in or register to enable rated Elo changes (+10 / -10 on win/loss in rated games).

### 2.6 Moving Pieces
- Drag a piece or click a piece then a highlighted destination tile.
- Auto Flip: enable to rotate board to current side to move.

### 2.7 Rematch / Draw / Resign
- Use in‑game buttons; both players must request rematch or draw for acceptance.

### Troubleshooting Stuck Loading Spinner
If the board shows a spinner indefinitely:
- Check browser console for errors loading `stockfish.js`.
- Ensure you are visiting the server with the same host/port it is running on (default `:3000`).
- Multiplayer features: if a red banner “Real-time connection failed” appears, Socket.IO could not connect. Verify the server is running and firewall allows port 3000. The page will still allow vs computer play.
- If you created a room and never receive color assignment, second player may not have joined or connection failed.
- Reload the page after restarting the server; stale WebSocket connections will not recover if server was killed.

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