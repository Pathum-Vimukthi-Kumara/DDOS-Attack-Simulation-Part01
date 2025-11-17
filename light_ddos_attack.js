#!/usr/bin/env node

const http = require('http')
const io = require('socket.io-client')

console.log('🎯 Starting LIGHT DDoS Attack for Testing Warnings')
console.log('═══════════════════════════════════════════════════')
console.log('🎯 Target: http://127.0.0.1:3000')
console.log('🚀 Attack Type: LIGHT (for testing warnings)')
console.log('⚡ Requests/sec: 30-50 (enough to trigger warnings)')
console.log('⏱️  Duration: 60s')
console.log('📋 Purpose: Test real-time warning popups')
console.log('═══════════════════════════════════════════════════')

const TARGET_URL = 'http://127.0.0.1:3000'
const DURATION = 60000 // 60 seconds
const RPS_TARGET = 35 // Light load to trigger medium threats

let totalRequests = 0
let successfulRequests = 0
let errors = 0
let timeouts = 0
let connectionRefused = 0

const startTime = Date.now()

// Light HTTP flood
function makeRequest() {
    return new Promise((resolve) => {
        const req = http.request(TARGET_URL, {
            method: 'GET',
            timeout: 5000,
            headers: {
                'User-Agent': 'LightDDoS-Test-Bot',
                'Accept': '*/*',
                'Connection': 'keep-alive'
            }
        }, (res) => {
            totalRequests++
            if (res.statusCode < 400) {
                successfulRequests++
            } else {
                errors++
            }
            resolve()
        })
        
        req.on('error', (err) => {
            totalRequests++
            if (err.code === 'ECONNREFUSED') {
                connectionRefused++
            } else if (err.code === 'ETIMEDOUT') {
                timeouts++
            } else {
                errors++
            }
            resolve()
        })
        
        req.on('timeout', () => {
            totalRequests++
            timeouts++
            req.destroy()
            resolve()
        })
        
        req.end()
    })
}

// Light socket connections
function createSocketConnection() {
    const socket = io(TARGET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 5000
    })
    
    socket.on('connect', () => {
        // Send some data
        socket.emit('test-message', { type: 'test', timestamp: Date.now() })
        
        // Disconnect after short time
        setTimeout(() => {
            socket.disconnect()
        }, 1000 + Math.random() * 2000)
    })
    
    socket.on('error', () => {
        socket.disconnect()
    })
}

// Status reporting
function showStatus() {
    const elapsed = (Date.now() - startTime) / 1000
    const remaining = Math.max(0, (DURATION - (Date.now() - startTime)) / 1000)
    const currentRPS = elapsed > 0 ? Math.round(totalRequests / elapsed) : 0
    const successRate = totalRequests > 0 ? ((successfulRequests / totalRequests) * 100).toFixed(1) : 0
    const errorRate = totalRequests > 0 ? ((errors / totalRequests) * 100).toFixed(1) : 0
    
    process.stdout.write(`\\r🔥 ${elapsed.toFixed(1)}s | RPS: ${currentRPS} | Success: ${successRate}% | Errors: ${errorRate}% | Remaining: ${remaining.toFixed(1)}s    `)
}

// Start attack
console.log('🚀 Starting light attack...')

const statusInterval = setInterval(showStatus, 1000)

// HTTP requests
const httpInterval = setInterval(() => {
    // Send burst of requests
    for (let i = 0; i < 5; i++) {
        setTimeout(() => makeRequest(), i * 50)
    }
    
    // Occasional socket connections
    if (Math.random() < 0.3) {
        createSocketConnection()
    }
}, 1000 / (RPS_TARGET / 5)) // Adjust timing for target RPS

// Stop after duration
setTimeout(() => {
    clearInterval(httpInterval)
    clearInterval(statusInterval)
    
    const elapsed = (Date.now() - startTime) / 1000
    const avgRPS = Math.round(totalRequests / elapsed)
    
    console.log('\\n\\n🛑 Stopping light attack...')
    console.log('📊 Checking server status...')
    
    // Check if server is still responsive
    const healthCheck = http.request(TARGET_URL, {
        method: 'GET',
        timeout: 3000
    }, (res) => {
        console.log('✅ Server is still responsive!')
        showFinalResults(avgRPS)
    })
    
    healthCheck.on('error', () => {
        console.log('❌ Server appears to be unresponsive')
        showFinalResults(avgRPS)
    })
    
    healthCheck.end()
}, DURATION)

function showFinalResults(avgRPS) {
    console.log('\\n═══════════════════════════════════════════════════')
    console.log('📊 LIGHT ATTACK RESULTS:')
    console.log('═══════════════════════════════════════════════════')
    console.log(`⏱️  Duration: ${(DURATION/1000).toFixed(2)}s`)
    console.log(`🚀 Total Requests: ${totalRequests.toLocaleString()}`)
    console.log(`✅ Successful: ${successfulRequests} (${((successfulRequests/totalRequests)*100).toFixed(1)}%)`)
    console.log(`❌ Failed: ${errors} (${((errors/totalRequests)*100).toFixed(1)}%)`)
    console.log(`⏰ Timeouts: ${timeouts}`)
    console.log(`🚫 Connection Refused: ${connectionRefused}`)
    console.log(`📈 Avg RPS: ${avgRPS}`)
    console.log(`🎯 ATTACK STATUS: Light load completed - warnings should have appeared!`)
    console.log('═══════════════════════════════════════════════════')
    
    process.exit(0)
}