# Enhanced DDoS Attack Configuration

## 🔥 EXTREME ATTACK - For Ubuntu Server Crashes

### Server Changes (chess/server.js):
✅ **Memory leak every 10 requests** (was 30)
✅ **50MB per memory leak** (was ~1MB)
✅ **Crash at 800 requests** (was 1,500)
✅ **Memory limit: 500MB** - crashes when exceeded
✅ **Aggressive circular references** (500 per leak cycle)
✅ **Real-time memory monitoring** in console

### Attack Options:

#### Option 1: Enhanced ddos_attack.js (RECOMMENDED)
```bash
node ddos_attack.js
```
- **12 workers** (was 8)
- **1000 RPS** (was 500)
- **60 second duration** (was 30)
- Should crash server in ~30-60 seconds

#### Option 2: EXTREME extreme_ddos_attack.js (NUCLEAR)
```bash
node extreme_ddos_attack.js
```
- **16 workers** 
- **1600 RPS** (100 per worker)
- **120 second duration**
- **Large payloads** (100KB per request)
- **Mixed attack patterns**
- **Memory exhaustion focus**
- Should crash server in ~15-30 seconds

### Expected Server Behavior:

1. **First 10 requests**: Normal operation
2. **Every 10 requests after**: 
   - 💀 Memory leak message
   - Memory usage display (MB)
   - Circular reference creation
3. **After ~100 requests**:
   - ⚠️ EXTREME MEMORY PRESSURE warning
   - Massive array growth
4. **Memory > 500MB OR Requests > 800**:
   - 💥💥💥 MEMORY LIMIT EXCEEDED - Server crashes
   - OR 💥 Server overwhelmed - Server crashes

### Console Output You'll See:

```
💀 MEMORY LEAK: 52.34MB / 65.12MB | Requests: 10
💀 MEMORY LEAK: 105.67MB / 130.45MB | Requests: 20
⚠️  EXTREME MEMORY PRESSURE! Array size: 5012
💀 MEMORY LEAK: 320.89MB / 385.23MB | Requests: 100
💀 MEMORY LEAK: 515.45MB / 550.78MB | Requests: 130
💥💥💥 MEMORY LIMIT EXCEEDED - CRASHING NOW! 💥💥💥
```

### Testing on Ubuntu:

1. **Start server on Ubuntu**:
```bash
cd ~/Desktop/Basic_Network_Project/DDOS-Attack-Simulation-Part01/chess
npm start
```

2. **Run attack from another terminal**:
```bash
cd ~/Desktop/Basic_Network_Project/DDOS-Attack-Simulation-Part01
node extreme_ddos_attack.js
```

3. **Monitor memory**:
```bash
# In another terminal
watch -n 1 'ps aux | grep node'
```

### Why This Crashes Ubuntu Servers:

1. **50MB memory leak every 10 requests** = Fast memory exhaustion
2. **Circular references** prevent garbage collection
3. **Buffer allocations** (100KB each) consume heap quickly
4. **Lower crash threshold** (800 requests vs 1500)
5. **Hard memory limit** (500MB) triggers immediate crash
6. **High request rate** (1000-1600 RPS) accelerates memory consumption

### Attack Comparison:

| Feature | Old Attack | Enhanced | Extreme | Ultra Extreme (NEW) |
|---------|-----------|----------|---------|---------------------|
| Workers | 8 | 12 | 16 | 20 |
| RPS | 500 | 1000 | 1600 | 3000 |
| Memory/Leak | ~1MB | 50MB | 50MB | 50MB |
| Leak Frequency | Every 30 | Every 10 | Every 10 | Every 10 |
| Crash Threshold | 1500 req | 800 req | 800 req | 800 req |
| Memory Limit | None | 500MB | 500MB | 500MB |
| Large Payloads | No | 50MB | 50MB | 50MB (configurable) |
| Crash Time | 2-3 min | 20-40 sec | 15-30 sec | 10-20 sec |

### NEW: Ultra Extreme Attack (For High-RAM Servers)

**Problem with High-Memory Ubuntu Servers:**
If your Ubuntu server has 8GB, 16GB, or more RAM, the original attacks might not crash it fast enough because:
- Small payloads (10KB-100KB) don't create enough memory pressure
- Server garbage collection can keep up with the load
- Large RAM allows buffering of many requests

**Solution: 50MB Payloads**

```bash
node ultra_extreme_attack.js
```
- **20 workers** (highest)
- **3000 RPS** (150 per worker)
- **50MB payloads** (matching server's 50MB leak)
- **Multiple attack patterns** (massive POST, bursts, nested JSON)
- **Burst mode** (extra 10 requests every 3 seconds)
- Should crash 8GB+ servers in **10-20 seconds**

**For 16GB+ RAM servers, use 100MB payloads:**
```bash
PAYLOAD_SIZE_MB=100 node ultra_extreme_attack.js
```

**Easy launcher script:**
```bash
bash launch_ultra_attack.sh
```

### Environment Variables:

```bash
# Target different server
TARGET_URL=http://192.168.1.100:3000 node extreme_ddos_attack.js

# From Ubuntu attacking Ubuntu
TARGET_URL=http://localhost:3000 node extreme_ddos_attack.js
```

### Safety Notes:

⚠️ **Only use on YOUR OWN servers**
⚠️ **Never attack production systems**
⚠️ **This WILL crash the server**
⚠️ **Data loss possible if transactions in progress**
⚠️ **Educational/demonstration purposes ONLY**

---

## Expected Results:

✅ Server crashes due to memory exhaustion
✅ Frontend detects crash and shows warning
✅ Auto-refresh activates after 10 seconds
✅ Server restarts show memory leak messages
✅ Attack warnings appear before crash (if server survives long enough)

## Troubleshooting:

**If server still doesn't crash (High-RAM servers):**

✅ **USE THE NEW ULTRA EXTREME ATTACK:**
```bash
node ultra_extreme_attack.js
```

This uses **50MB payloads** instead of 10KB-100KB, which matches the server's 50MB memory leak and creates massive memory pressure.

**For very high-RAM servers (16GB+):**
```bash
# Use 100MB payloads
PAYLOAD_SIZE_MB=100 node ultra_extreme_attack.js

# Or 200MB for extreme cases
PAYLOAD_SIZE_MB=200 node ultra_extreme_attack.js
```

**Other options:**
1. Use the launcher script: `bash launch_ultra_attack.sh`
2. Run multiple attack scripts simultaneously from different terminals
3. Reduce crash threshold to 400 requests in server.js
4. Increase memory leak size to 100MB in server.js
5. Decrease leak frequency to every 5 requests in server.js

**See HIGH_MEMORY_SERVER_SOLUTION.md for detailed explanation**
