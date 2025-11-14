# DDoS Attack Demonstration

This project demonstrates how a DDoS (Distributed Denial of Service) attack can crash an unprotected server.

## 🎯 Educational Purpose

This demonstration shows:
- How DDoS attacks work
- The vulnerability of unprotected servers
- The importance of implementing DDoS protection

## 📋 Prerequisites

1. **Start the Chess Server:**
   ```bash
   cd chess
   npm install
   npm start
   ```
   Server will run on `http://localhost:3000`

2. **Install Attack Dependencies:**
   ```bash
   npm install
   ```

## 🚀 Running the DDoS Attack

1. **Make sure the chess server is running** (in a separate terminal)
2. **Launch the attack:**
   ```bash
   npm run attack
   ```

## 🔥 Attack Vectors

The simulator uses multiple attack vectors:

1. **HTTP Request Flood**: 2000 HTTP requests to overwhelm the web server
2. **Socket Connection Flood**: 1000 WebSocket connections with event spam
3. **Memory Exhaustion**: Large payload attacks to consume server memory

## 📊 Expected Results

When the attack is successful, you should see:

### In the Attack Terminal:
```
🔥 DDoS Attack Simulator Starting...
🌊 Starting HTTP Request Flood...
⚡ Starting Socket Connection Flood...
💾 Starting Memory Exhaustion Attack...
💥 All attack vectors launched!
❌ HTTP Errors: 100
❌ HTTP Errors: 200
🎯 SERVER APPEARS TO BE DOWN - Attack Successful!
```

### In the Chess Server Terminal:
```
Error: read ECONNRESET
Error: write EPIPE
MaxListenersExceededWarning: Possible EventEmitter memory leak detected
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

## 🛡️ What This Demonstrates

1. **Unprotected servers are vulnerable** to connection flooding
2. **Memory leaks** can occur with too many connections
3. **Event spam** can overwhelm socket handlers
4. **No rate limiting** allows attackers to consume all resources

## 🔧 Recovery

If the server crashes:
1. Stop the attack with `Ctrl+C`
2. Restart the chess server: `cd chess && npm start`

## ⚠️ Important Notes

- **Use only for educational purposes**
- **Test only on your own servers**
- **Never attack servers you don't own**
- **This demonstrates why DDoS protection is essential**

## 🛡️ Protection Measures (Not Implemented)

To protect against such attacks, servers should implement:
- Rate limiting
- Connection throttling
- Request size limits
- DDoS protection services (CloudFlare, AWS Shield, etc.)
- Load balancing
- Circuit breakers

## 📝 Customization

Modify attack intensity in `ddos_simulator.js`:
```javascript
const ATTACK_INTENSITY = {
    CONNECTIONS: 1000,        // Number of socket connections
    HTTP_REQUESTS: 2000,      // Number of HTTP requests
    EVENTS_PER_SECOND: 100,   // Events per socket per second
    DURATION: 30              // Attack duration in seconds
};
```