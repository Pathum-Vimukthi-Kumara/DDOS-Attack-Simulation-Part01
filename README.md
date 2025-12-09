# DDoS Attack Demonstration

This project demonstrates how a DDoS (Distributed Denial of Service) attack can crash an unprotected server.

## 🚨 HIGH-MEMORY SERVER UPDATE

**If you're testing on Ubuntu servers with 8GB+ RAM**, the standard attacks might not crash your server fast enough. 

**Quick Fix:**
```bash
# Use the ultra extreme attack with 50MB payloads
node ultra_extreme_attack.js
```

**📚 Read these guides:**
- **QUICK_REFERENCE.md** - One-page quick start
- **HIGH_MEMORY_SERVER_SOLUTION.md** - Detailed explanation
- **VISUAL_COMPARISON.md** - Before/after diagrams

## 🎯 Educational Purpose

This demonstration shows:
- How DDoS attacks work
- The vulnerability of unprotected servers
- The importance of implementing DDoS protection
- Why payload size matters for high-RAM servers

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

### For Standard Servers (4GB RAM or less):
1. **Make sure the chess server is running** (in a separate terminal)
2. **Launch the attack:**
   ```bash
   npm run attack
   ```

### For High-Memory Ubuntu Servers (8GB+ RAM):
**Problem:** Standard attacks with 10KB-100KB payloads won't crash high-RAM servers.

**Solution:** Use attacks with 50MB+ payloads:

```bash
# Easy mode - Interactive menu
bash launch_ultra_attack.sh

# Manual - Best for 8GB-16GB servers
node ultra_extreme_attack.js

# Manual - For 16GB+ servers
PAYLOAD_SIZE_MB=100 node ultra_extreme_attack.js
```

**See QUICK_REFERENCE.md for your specific server RAM size.**

## 🔥 Attack Options

### 1. Light Attack (Testing Only)
```bash
node light_ddos_attack.js
```
- Won't crash server
- Triggers warnings only
- Good for testing monitoring

### 2. Enhanced Attack (4GB servers)
```bash
node ddos_attack.js
```
- **UPDATED:** Now uses 50MB payloads
- 12 workers, 1000 RPS
- Crashes in 20-40 seconds

### 3. Extreme Attack (8GB servers)
```bash
node extreme_ddos_attack.js
```
- **UPDATED:** Now uses 50MB payloads
- 16 workers, 1600 RPS
- Crashes in 15-30 seconds

### 4. Ultra Extreme Attack (8GB-16GB servers) ⭐ RECOMMENDED
```bash
node ultra_extreme_attack.js
```
- **NEW:** Optimized for high-RAM servers
- 20 workers, 3000 RPS
- 50MB payloads (configurable)
- Multiple attack patterns
- Crashes in 10-20 seconds

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

### For Different Server RAM Sizes:

| Server RAM | Command | Crash Time |
|-----------|---------|------------|
| 4GB | `node ddos_attack.js` | 10-20s |
| 8GB | `node ultra_extreme_attack.js` | 10-20s |
| 16GB | `PAYLOAD_SIZE_MB=100 node ultra_extreme_attack.js` | 20-40s |
| 32GB+ | `PAYLOAD_SIZE_MB=200 node ultra_extreme_attack.js` | 30-60s |

### Custom Payload Size:
```bash
# Set custom payload (in MB)
PAYLOAD_SIZE_MB=75 node ultra_extreme_attack.js
```

### Modify attack intensity in attack scripts:
```javascript
// In ultra_extreme_attack.js
const WORKERS = 20                // Number of concurrent workers
const REQUESTS_PER_WORKER = 150   // Requests per worker per second
const PAYLOAD_SIZE_MB = 50        // Payload size in megabytes
const DURATION = 180              // Attack duration in seconds
```

## 📚 Documentation

- **QUICK_REFERENCE.md** - Quick command reference for your RAM size
- **HIGH_MEMORY_SERVER_SOLUTION.md** - Why 50MB payloads work
- **VISUAL_COMPARISON.md** - Before/after attack diagrams
- **CHANGES_SUMMARY.md** - Complete list of changes
- **EXTREME_ATTACK_GUIDE.md** - Detailed attack configuration guide
- **UBUNTU_DEPLOYMENT.md** - Ubuntu deployment instructions