'use strict'

import { Game } from './modules/game.js'

import { gamemode, color } from './modules/constants.js'

import { createBoard } from './modules/board.js'

import { ping, getColorForPing } from './modules/ping.js'

import { serverDelay } from './modules/serverDelay.js'

// Reverted to previous hardcoded socket endpoint as requested
const socket = io('http://192.168.8.104:3000')

// DDoS Attack Warning System
let attackWarningActive = false
let autoRefreshTimer = null
let isServerUnderAttack = false
let refreshCountdown = 0
let serverMonitorInterval = null
let lastServerResponse = Date.now()
let serverFailureDetected = false
let connectionAttempts = 0
let maxConnectionAttempts = 3
let refreshOnNextError = false
let healthCheckInterval = null
let consecutiveFailures = 0
let attackMetrics = { rps: 0, isUnderAttack: false, threatLevel: 'normal' }

// Create attack warning overlay
function createAttackWarning(data) {
    // Remove existing warning
    const existing = document.getElementById('ddos-warning')
    if (existing) existing.remove()
    
    isServerUnderAttack = true
    
    const warning = document.createElement('div')
    warning.id = 'ddos-warning'
    warning.innerHTML = `
        <div class="ddos-warning-content">
            <div class="ddos-warning-header">
                <span class="ddos-warning-icon">🚨</span>
                <h2>DDOS ATTACK DETECTED</h2>
                <span class="ddos-warning-icon">🚨</span>
            </div>
            <div class="ddos-warning-body">
                <p class="ddos-message">${data.message}</p>
                <div class="ddos-metrics">
                    <div class="metric">
                        <span class="label">Attack Type:</span>
                        <span class="value">${data.type.toUpperCase()}</span>
                    </div>
                    <div class="metric">
                        <span class="label">Threat Level:</span>
                        <span class="value threat-${data.level}">${data.level.toUpperCase()}</span>
                    </div>
                    <div class="metric">
                        <span class="label">Current RPS:</span>
                        <span class="value">${data.rps}</span>
                    </div>
                    <div class="metric">
                        <span class="label">Requests/Min:</span>
                        <span class="value">${data.rpm}</span>
                    </div>
                </div>
                <div class="ddos-warning-time">
                    Attack detected at: ${new Date(data.timestamp).toLocaleTimeString()}
                </div>
                <div class="ddos-refresh-info">
                    🔄 Auto-refreshing page in <span id="refresh-countdown">5</span> seconds...
                    <br><button onclick="window.location.reload()" style="margin-top:10px;padding:5px 15px;background:#ff4757;color:white;border:none;border-radius:4px;cursor:pointer;">Refresh Now</button>
                </div>
            </div>
        </div>
    `
    
    // Add styles
    warning.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: ddosWarningSlideIn 0.5s ease-out;
    `
    
    document.body.appendChild(warning)
    attackWarningActive = true
    
    // Start auto-refresh countdown
    startAutoRefreshCountdown(5)
    
    // Add CSS for the warning
    if (!document.getElementById('ddos-warning-styles')) {
        const style = document.createElement('style')
        style.id = 'ddos-warning-styles'
        style.textContent = `
            @keyframes ddosWarningSlideIn {
                from { opacity: 0; transform: scale(0.8); }
                to { opacity: 1; transform: scale(1); }
            }
            
            @keyframes ddosPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            .ddos-warning-content {
                background: linear-gradient(135deg, #ff4757, #ff3838);
                border: 3px solid #fff;
                border-radius: 20px;
                padding: 30px;
                max-width: 600px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(255, 71, 87, 0.3);
                animation: ddosPulse 2s infinite;
            }
            
            .ddos-warning-header {
                text-align: center;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
            }
            
            .ddos-warning-header h2 {
                color: white;
                margin: 0;
                font-size: 28px;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                letter-spacing: 2px;
            }
            
            .ddos-warning-icon {
                font-size: 32px;
                animation: ddosIconBounce 1s infinite;
            }
            
            @keyframes ddosIconBounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            
            .ddos-message {
                color: white;
                font-size: 18px;
                text-align: center;
                margin: 20px 0;
                font-weight: 500;
            }
            
            .ddos-metrics {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin: 20px 0;
                background: rgba(255,255,255,0.1);
                padding: 20px;
                border-radius: 10px;
            }
            
            .metric {
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: white;
                font-size: 14px;
            }
            
            .metric .label {
                font-weight: 500;
                opacity: 0.9;
            }
            
            .metric .value {
                font-weight: bold;
                font-size: 16px;
            }
            
            .threat-critical {
                color: #ffff00 !important;
                text-shadow: 0 0 10px #ffff00;
                animation: ddosGlow 1s infinite alternate;
            }
            
            .threat-high {
                color: #ffa500 !important;
            }
            
            .threat-medium {
                color: #87ceeb !important;
            }
            
            @keyframes ddosGlow {
                from { text-shadow: 0 0 5px #ffff00; }
                to { text-shadow: 0 0 20px #ffff00, 0 0 30px #ffff00; }
            }
            
            .ddos-warning-time {
                text-align: center;
                color: rgba(255,255,255,0.8);
                font-size: 12px;
                margin-top: 15px;
                font-style: italic;
            }
        `
        document.head.appendChild(style)
    }
}

// Create attack stopped notification
function showAttackStopped(data) {
    const existing = document.getElementById('ddos-warning')
    if (existing) existing.remove()
    
    attackWarningActive = false
    
    // Show brief "attack stopped" message
    const notification = document.createElement('div')
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2ecc71;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 5px 15px rgba(46, 204, 113, 0.3);
        animation: slideInRight 0.5s ease-out;
    `
    notification.innerHTML = `
        ✅ Attack Stopped<br>
        <small>Duration: ${Math.round(data.duration / 1000)}s</small>
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
        notification.style.transition = 'all 0.5s ease-out'
        notification.style.opacity = '0'
        notification.style.transform = 'translateX(100%)'
        setTimeout(() => notification.remove(), 500)
    }, 3000)
    
    // Add animation style if not exists
    if (!document.getElementById('slide-animation-style')) {
        const style = document.createElement('style')
        style.id = 'slide-animation-style'
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `
        document.head.appendChild(style)
    }
}

// Auto-refresh countdown function
function startAutoRefreshCountdown(seconds) {
    clearTimeout(autoRefreshTimer)
    refreshCountdown = seconds
    
    // Update countdown display
    const countdownElement = document.getElementById('refresh-countdown')
    if (countdownElement) {
        countdownElement.textContent = refreshCountdown
    }
    
    // Start countdown interval
    const countdownInterval = setInterval(() => {
        refreshCountdown--
        const element = document.getElementById('refresh-countdown')
        if (element) {
            element.textContent = refreshCountdown
        }
        
        if (refreshCountdown <= 0) {
            clearInterval(countdownInterval)
            console.log('🔄 Auto-refreshing page due to DDoS attack...')
            window.location.reload()
        }
    }, 1000)
    
    // Set main refresh timer as backup
    autoRefreshTimer = setTimeout(() => {
        clearInterval(countdownInterval)
        window.location.reload()
    }, seconds * 1000)
}

// Server monitoring and failure detection
function startServerMonitoring() {
    // Prevent multiple monitoring intervals
    if (serverMonitorInterval) {
        console.log('🔍 Server monitoring already active')
        return
    }
    
    console.log('🔍 Starting aggressive frontend server monitoring...')
    
    // Monitor socket connection status
    socket.on('connect', () => {
        lastServerResponse = Date.now()
        serverFailureDetected = false
        connectionAttempts = 0
        consecutiveFailures = 0
        console.log('✅ Connected to server')
        hideServerFailureWarning()
    })
    
    socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from server:', reason)
        handleServerDisconnection(reason)
    })
    
    socket.on('connect_error', (error) => {
        console.log('❌ Connection error:', error.message)
        consecutiveFailures++
        handleServerFailure('Connection failed: ' + error.message)
    })
    
    // Any successful response resets failure detection
    socket.on('connections', () => { lastServerResponse = Date.now(); consecutiveFailures = 0; })
    socket.on('playing', () => { lastServerResponse = Date.now(); consecutiveFailures = 0; })
    socket.on('server-delay', () => { lastServerResponse = Date.now(); consecutiveFailures = 0; })
    socket.on('pong', () => { lastServerResponse = Date.now(); consecutiveFailures = 0; })
    
    // Start aggressive health checking with HTTP requests
    startHttpHealthCheck()
    
    // Monitor for server responsiveness every 3 seconds (aggressive)
    serverMonitorInterval = setInterval(() => {
        const timeSinceLastResponse = Date.now() - lastServerResponse
        
        // If no response for 15 seconds, start failure process
        if (timeSinceLastResponse > 15000 && !serverFailureDetected) {
            console.log('⚠️ Server appears unresponsive (15s timeout)')
            handleServerFailure('Server not responding (15s timeout)')
        }
        
        // If disconnected for more than 10 seconds, definitely show failure
        if (!socket.connected && timeSinceLastResponse > 10000 && !serverFailureDetected) {
            handleServerFailure('Server disconnected (10s timeout)')
        }
        
        // If too many consecutive failures, force refresh
        if (consecutiveFailures >= 5 && !serverFailureDetected) {
            handleServerFailure(`Multiple failures detected (${consecutiveFailures})`)
        }
    }, 10000) // Check every 10 seconds
    
    // Send ping every 4 seconds
    setInterval(() => {
        if (socket.connected) {
            socket.emit('ping')
        }
    }, 4000)
}

// HTTP-based health checking (independent of WebSocket)
function startHttpHealthCheck() {
    healthCheckInterval = setInterval(() => {
        // Only do HTTP health checks if we suspect issues
        const timeSinceLastResponse = Date.now() - lastServerResponse
        if (timeSinceLastResponse > 12000 || !socket.connected) {
            performHttpHealthCheck()
        }
    }, 5000)
}

// Perform HTTP health check to detect server crashes
function performHttpHealthCheck() {
    console.log('🏥 Performing HTTP health check...')
    
    const healthCheck = fetch(window.location.origin + '/health', {
        method: 'GET',
        timeout: 10000
    }).then(response => {
        if (response.ok) {
            console.log('✅ HTTP health check passed')
            lastServerResponse = Date.now()
            consecutiveFailures = 0
        } else {
            throw new Error(`HTTP ${response.status}`)
        }
    }).catch(error => {
        console.log('❌ HTTP health check failed:', error.message)
        consecutiveFailures++
        if (consecutiveFailures >= 4 && !serverFailureDetected) {
            handleServerFailure('HTTP health check failed: ' + error.message)
        }
    })
    
    // Fallback: If fetch takes too long, consider it a failure
    setTimeout(() => {
        consecutiveFailures++
        if (consecutiveFailures >= 4 && !serverFailureDetected) {
            handleServerFailure('HTTP health check timeout')
        }
    }, 4000)
}

// Handle server disconnection
function handleServerDisconnection(reason) {
    consecutiveFailures++
    
    // Common disconnect reasons that indicate server issues
    const serverIssueReasons = ['transport close', 'transport error', 'server error', 'ping timeout']
    
    if (serverIssueReasons.some(issue => reason.includes(issue)) || consecutiveFailures >= 2) {
        handleServerFailure('Server disconnected: ' + reason)
    } else {
        // Try to reconnect first
        setTimeout(() => {
            if (!socket.connected && !serverFailureDetected) {
                handleServerFailure('Unable to reconnect: ' + reason)
            }
        }, 3000)
    }
}

// Handle any type of server failure
function handleServerFailure(reason) {
    if (!serverFailureDetected) {
        serverFailureDetected = true
        console.log('💥 Server failure detected:', reason)
        
        // Start monitoring if not already active
        if (!serverMonitorInterval) {
            startServerMonitoring()
            console.log('🔍 Server monitoring activated due to failure detection')
        }
        
        showServerFailureWarning(reason)
    }
}

// Show server failure warning with auto-refresh
function showServerFailureWarning(reason) {
    // Remove existing warnings
    hideServerFailureWarning()
    
    console.log('🚨 Showing server failure warning:', reason)
    
    const warning = document.createElement('div')
    warning.id = 'server-failure-warning'
    warning.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.95);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.5s ease-out;
    `
    
    warning.innerHTML = `
        <div style="
            background: linear-gradient(45deg, #e74c3c, #c0392b);
            color: white;
            padding: 40px;
            border-radius: 15px;
            text-align: center;
            max-width: 500px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            border: 2px solid #ff6b6b;
        ">
            <div style="font-size: 48px; margin-bottom: 20px;">💥</div>
            <h2 style="margin: 0 0 15px 0; font-size: 24px;">SERVER CRASHED / UNREACHABLE</h2>
            <p style="margin: 0 0 20px 0; font-size: 16px; opacity: 0.9;">${reason}</p>
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin: 20px 0;">
                <div style="font-size: 14px; margin-bottom: 10px;">Likely causes:</div>
                <div style="font-size: 13px; text-align: left;">
                    • 🚀 DDoS attack crashed the server<br>
                    • 💾 Server ran out of memory<br>
                    • 🌐 Network connectivity issues<br>
                    • ⚡ Server overload and crash
                </div>
            </div>
            <div style="background: rgba(255,255,0,0.2); padding: 10px; border-radius: 6px; margin: 15px 0; border: 1px solid #ffd700;">
                <div style="font-size: 14px; font-weight: bold;">⚡ AUTOMATIC RECOVERY ACTIVE</div>
                <div style="font-size: 12px; margin-top: 5px;">This page will automatically refresh to restore service</div>
            </div>
            <div style="font-size: 18px; margin: 20px 0; font-weight: bold;">
                🔄 Auto-refreshing in <span id="failure-countdown">6</span> seconds...
            </div>
            <button onclick="window.location.reload()" style="
                background: #27ae60;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                margin-right: 10px;
                box-shadow: 0 3px 10px rgba(39,174,96,0.3);
            ">🔄 Refresh Now</button>
            <button onclick="hideServerFailureWarning(); setTimeout(() => showServerFailureWarning('${reason}'), 10000)" style="
                background: transparent;
                color: white;
                border: 2px solid white;
                padding: 10px 20px;
                border-radius: 6px;
                font-size: 14px;
                cursor: pointer;
            ">Wait 10s</button>
        </div>
    `
    
    // Add fade in animation
    if (!document.getElementById('fade-animation-style')) {
        const style = document.createElement('style')
        style.id = 'fade-animation-style'
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.8); }
                to { opacity: 1; transform: scale(1); }
            }
        `
        document.head.appendChild(style)
    }
    
    document.body.appendChild(warning)
    
    // Start countdown with shorter timer (6 seconds instead of 10)
    startFailureRefreshCountdown(6)
    
    // Play warning sound
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFAlGn+Dmt2AeAg==')
        audio.volume = 0.3
        audio.play().catch(() => {})
    } catch (e) {}
}

// Hide server failure warning
function hideServerFailureWarning() {
    const warning = document.getElementById('server-failure-warning')
    if (warning) {
        warning.remove()
    }
    clearTimeout(autoRefreshTimer)
}

// Failure refresh countdown
function startFailureRefreshCountdown(seconds) {
    clearTimeout(autoRefreshTimer)
    let countdown = seconds
    
    const countdownElement = document.getElementById('failure-countdown')
    if (countdownElement) {
        countdownElement.textContent = countdown
    }
    
    const countdownInterval = setInterval(() => {
        countdown--
        const element = document.getElementById('failure-countdown')
        if (element) {
            element.textContent = countdown
        }
        
        if (countdown <= 0) {
            clearInterval(countdownInterval)
            console.log('🔄 Auto-refreshing due to server failure...')
            window.location.reload()
        }
    }, 1000)
    
    autoRefreshTimer = setTimeout(() => {
        clearInterval(countdownInterval)
        window.location.reload()
    }, seconds * 1000)
}

// Create real-time metrics display
function createMetricsDisplay() {
    let metricsDisplay = document.getElementById('ddos-metrics-display')
    if (!metricsDisplay) {
        metricsDisplay = document.createElement('div')
        metricsDisplay.id = 'ddos-metrics-display'
        metricsDisplay.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            min-width: 200px;
        `
        document.body.appendChild(metricsDisplay)
    }
    return metricsDisplay
}

// Update metrics display
function updateMetricsDisplay(metrics) {
    const display = createMetricsDisplay()
    const statusColor = metrics.isUnderAttack ? '#ff4757' : (metrics.rps > 50 ? '#ffa502' : '#2ed573')
    const statusText = metrics.isUnderAttack ? '🚨 UNDER ATTACK' : (metrics.rps > 50 ? '⚠️ HIGH LOAD' : '✅ NORMAL')
    
    display.innerHTML = `
        <div style="color: ${statusColor}; font-weight: bold; margin-bottom: 5px;">
            ${statusText}
        </div>
        <div>RPS: <span style="color: ${statusColor}">${metrics.rps}</span></div>
        <div>Threat: <span style="color: ${statusColor}">${metrics.threatLevel.toUpperCase()}</span></div>
        <div style="font-size: 10px; margin-top: 5px; opacity: 0.7;">
            Updated: ${new Date().toLocaleTimeString()}
        </div>
    `
}

// Socket event listeners for attack detection
socket.on('attack-metrics', (data) => {
    console.log('📊 Attack metrics:', `${data.rps} RPS, Under attack: ${data.isUnderAttack}`)
    
    // Show metrics in console for debugging
    if (data.rps > 5) {
        console.log(`⚠️ High traffic detected: ${data.rps} requests/second`)
    }
})

socket.on('ddos-attack-detected', (data) => {
    console.log('🚨 DDoS Attack Detected:', data)
    createAttackWarning(data)
    
    // Play alert sound if possible
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaAzSKzO+6bywEhJC+09tySUq7h9LydSg=')
        audio.volume = 0.3
        audio.play().catch(() => {}) // Ignore if audio fails
    } catch (e) {}
})

socket.on('ddos-attack-stopped', (data) => {
    console.log('✅ DDoS Attack Stopped:', data)
    isServerUnderAttack = false
    showAttackStopped(data)
    
    // Auto-refresh after attack stops
    clearTimeout(autoRefreshTimer)
    autoRefreshTimer = setTimeout(() => {
        console.log('🔄 Auto-refreshing page after attack ended...')
        window.location.reload()
    }, 3000) // 3 second delay
})

// Auto-refresh on connection issues during attacks
socket.on('disconnect', () => {
    if (isServerUnderAttack) {
        console.log('🔌 Connection lost during attack - auto-refreshing...')
        clearTimeout(autoRefreshTimer)
        autoRefreshTimer = setTimeout(() => {
            window.location.reload()
        }, 2000)
    }
})

socket.on('connect_error', () => {
    if (isServerUnderAttack) {
        console.log('❌ Connection error during attack - auto-refreshing...')
        clearTimeout(autoRefreshTimer)
        autoRefreshTimer = setTimeout(() => {
            window.location.reload()
        }, 3000)
    }
})

// Initialize basic connection monitoring (not aggressive failure detection)
document.addEventListener('DOMContentLoaded', () => {
    // Only basic connection handling - no aggressive monitoring
    console.log('🔍 Basic connection monitoring initialized (no failure detection)')
    
    // Add basic socket event handlers for connection status
    socket.on('connect', () => {
        console.log('✅ Connected to server')
        lastServerResponse = Date.now()
        serverFailureDetected = false
        hideServerFailureWarning()
    })
    
    socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from server:', reason)
        // Only trigger failure detection if disconnect is unexpected
        if (reason === 'transport close' || reason === 'transport error') {
            handleServerFailure('Connection lost: ' + reason)
        }
    })
    
    // Add global error monitoring for additional failure detection
    window.addEventListener('error', (event) => {
        if (event.error && (event.error.message.includes('fetch') || event.error.message.includes('network'))) {
            consecutiveFailures++
            console.log('🌐 Network error detected:', event.error.message)
            if (consecutiveFailures >= 2 && !serverFailureDetected) {
                handleServerFailure('Network error: ' + event.error.message)
            }
        }
    })
    
    // Monitor for unhandled promise rejections (often network related)
    window.addEventListener('unhandledrejection', (event) => {
        if (event.reason && event.reason.toString().includes('fetch')) {
            consecutiveFailures++
            console.log('🌐 Fetch promise rejected:', event.reason)
            if (consecutiveFailures >= 1 && !serverFailureDetected) {
                handleServerFailure('Fetch failed: ' + event.reason)
            }
        }
    })
    
    // Monitor page visibility - if user comes back and server is down, refresh immediately
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && serverFailureDetected) {
            console.log('👁️ User returned to page with server failure - refreshing...')
            setTimeout(() => window.location.reload(), 1000)
        }
    })
})

// Monitoring only starts during attacks - not automatically
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', startServerMonitoring)
// } else {
//     startServerMonitoring()
// }

// Ping for keeping connection alive
socket.on('ping', (data) => {
    socket.emit('pong', data)
    lastServerResponse = Date.now()
})

const pingConfig = {
    good: {
        color: '#00bb00',
        min: 0,
        max: 170,
    },
    medium: {
        color: '#ffcc00',
        min: 171,
        max: 400,
    },
    bad: {
        color: '#cc0000',
        min: 401,
        max: 800,
    },
    veryBad: {
        color: '#770000',
        min: 801,
        max: Infinity,
    },
}

ping.config(document.querySelector('.ping-wrapper .ping-value'), 5000, pingConfig)
serverDelay.config(socket, document.querySelector('.ping-wrapper .server-value'), pingConfig)

socket.on('sign-out', () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    location.href = '/login'
})

if (localStorage.getItem('token') && localStorage.getItem('username')) {
    const signOutBtn = document.querySelector('header button.sign-out')
    document.querySelector('header a.sign-in').classList.add('hidden')

    signOutBtn.onclick = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        location.reload()
    }

    signOutBtn.textContent = `${localStorage.getItem('username')} | Sign out`

    signOutBtn.classList.remove('hidden')
}

let playerColor = color.white

const urlParams = new URLSearchParams(window.location.search)
const gamemodeDiv = document.querySelector('div.play .gamemode')

const board = createBoard(
    undefined,
    () => {
        if (game) game.startPos()
        gamemodeDiv.parentElement.parentElement.classList.remove('hidden')
    },
    socket,
)

const placeholderBoard = createBoard(document.body)

socket.on('color', (data) => {
    playerColor = data
    if (playerColor === 'black') {
        board.classList.add('flipped')
        if (placeholderBoard) placeholderBoard.classList.add('flipped')
    } else {
        board.classList.remove('flipped')
        if (placeholderBoard) placeholderBoard.classList.remove('flipped')
    }
})

const createRoomButton = document.querySelector('button.create-room')

const waitingDiv = document.createElement('div')
waitingDiv.classList.add('waiting')
waitingDiv.textContent = `Waiting for opponent...`
const link = document.createElement('a')
link.href = location.href
link.textContent = link.href
link.target = '_blank'
waitingDiv.appendChild(link)

const copyLinkBtn = document.createElement('button')
copyLinkBtn.textContent = 'Copy link'
copyLinkBtn.onclick = () => {
    navigator.clipboard
        .writeText(link.href)
        .then(() => {
            copyLinkBtn.textContent = 'Copied!'
            setTimeout(() => {
                copyLinkBtn.textContent = 'Copy link'
            }, 1000)
        })
        .catch(() => {
            copyLinkBtn.textContent = 'Error!'
            setTimeout(() => {
                copyLinkBtn.textContent = 'Copy link'
            }, 1000)
        })
}
waitingDiv.appendChild(copyLinkBtn)

const shareData = {
    title: 'Chess!',
    text: 'Play chess with me!',
    url: location.href,
}

const shareBtn = document.createElement('button')
shareBtn.textContent = 'Share'
shareBtn.onclick = () => {
    navigator
        .share(shareData)
        .then(() => {
            shareBtn.textContent = 'Shared!'
            setTimeout(() => {
                shareBtn.textContent = 'Share'
            }, 1000)
        })
        .catch(() => {
            shareBtn.textContent = 'Error!'
            setTimeout(() => {
                shareBtn.textContent = 'Share'
            }, 1000)
        })
}
waitingDiv.appendChild(shareBtn)

if (urlParams.has('r')) {
    gamemodeDiv.parentElement.parentElement.classList.add('hidden')
    socket.on('not-found', () => {
        alert('not found')
        window.location.search = ''
    })
    socket.on('join-room', (data) => {
        if (data.startsWith('error:')) {
            alert(data.split(':')[1])
            window.location.search = ''
            return
        }
    })
    socket.emit('join-room', {
        roomId: urlParams.get('r'),
        token: localStorage.getItem('token'),
        color: sessionStorage.getItem('color') || 'white',
    })
    sessionStorage.removeItem('color')
    document.body.appendChild(waitingDiv)
}

let creating = false

createRoomButton.onclick = () => {
    socket.on('create-room', (roomId) => {
        if ((roomId + '').startsWith('error')) {
            creating = false
            const error = (roomId + '').split(':')[1]
            alert(error)
            return
        }
        const urlParams = new URLSearchParams(window.location.search)
        urlParams.set('r', roomId)
        window.location.search = urlParams.toString()
    })
    document.body.appendChild(createTimeSelector())
}

function createOptions(...args) {
    const options = []
    args.forEach((arg) => {
        const option = document.createElement('option')
        if (typeof option === 'object') {
            option.textContent = arg.text
            option.value = arg.value
        } else {
            option.textContent = arg
            option.value = arg
        }
        options.push(option)
    })
    return options
}

const times = {
    t30: 60,
    t31: 75,
    t32: 90,
    t33: 105,
    t34: 120,
    t35: 135,
    t36: 150,
    t37: 165,
}

function indexToMinutes(i) {
    i = +i
    if (i === 0) return 0
    if (i === 1) return 0.25
    if (i === 2) return 0.5
    if (i === 3) return 0.75
    if (i === 4) return 1
    if (i === 5) return 1.5
    if (i >= 6 && i <= 24) return i - 4
    if (i === 25) return 25
    if (i === 26) return 30
    if (i === 27) return 35
    if (i === 28) return 40
    if (i === 29) return 45
    if (i >= 30 && i <= 37) return times['t' + i]
    return 180
}

function createTimeSelector() {
    const createGameDiv = document.createElement('div')
    createGameDiv.classList.add('create-game')

    const timeDiv = document.createElement('div')
    timeDiv.classList.add('time-selector')
    const timeInput = document.createElement('input')
    timeInput.classList.add('range')
    timeInput.type = 'range'
    timeInput.min = '1'
    timeInput.max = '38'
    timeInput.value = '14'
    timeInput.step = '1'
    /* const timeInput = document.createElement('input')
    timeInput.type = 'number'
    timeInput.min = '0'
    timeInput.max = '3600'
    timeInput.value = '600' */

    const timeLabel = document.createElement('label')
    const span = document.createElement('span')
    const bold = document.createElement('b')
    span.textContent = 'Minutes per side:'
    span.appendChild(bold)
    bold.textContent = 10
    timeLabel.appendChild(span)
    timeLabel.appendChild(timeInput)

    timeInput.oninput = () => {
        bold.textContent = indexToMinutes(timeInput.value)
    }

    let isRated = true

    const btns = document.createElement('div')
    btns.classList.add('btns')
    const ratedButton = document.createElement('div')
    ratedButton.classList.add('rated-btn', 'toggle', 'selected')
    ratedButton.textContent = 'Rated'
    const casualButton = document.createElement('div')
    casualButton.classList.add('casual-btn', 'toggle')
    casualButton.textContent = 'Casual'

    ratedButton.onclick = () => {
        isRated = true
        ratedButton.classList.add('selected')
        casualButton.classList.remove('selected')
    }
    casualButton.onclick = () => {
        isRated = false
        ratedButton.classList.remove('selected')
        casualButton.classList.add('selected')
    }

    btns.appendChild(ratedButton)
    btns.appendChild(casualButton)
    /* const ratedSelect = document.createElement('select')
    const ratedOption = document.createElement('option')
    ratedOption.value = 'rated'
    ratedOption.textContent = 'Rated'
    ratedOption.selected = true
    const casualOption = document.createElement('option')
    casualOption.value = 'casual'
    casualOption.textContent = 'Casual' */
    // ratedSelect.appendChild(ratedOption)
    // ratedSelect.appendChild(casualOption)

    const ratedLabel = document.createElement('label')
    ratedLabel.textContent = 'Game mode'
    ratedLabel.appendChild(btns)
    ratedLabel.classList.add('game-mode')
    // ratedLabel.appendChild(ratedSelect)

    let isPublic = true

    const visBtns = document.createElement('div')
    visBtns.classList.add('btns')
    const publicButton = document.createElement('div')
    publicButton.classList.add('public-btn', 'toggle', 'selected')
    publicButton.textContent = 'Public'
    const privateButton = document.createElement('div')
    privateButton.classList.add('private-btn', 'toggle')
    privateButton.textContent = 'Private'

    publicButton.onclick = () => {
        isPublic = true
        publicButton.classList.add('selected')
        privateButton.classList.remove('selected')
    }
    privateButton.onclick = () => {
        isPublic = false
        publicButton.classList.remove('selected')
        privateButton.classList.add('selected')
    }

    visBtns.appendChild(publicButton)
    visBtns.appendChild(privateButton)

    const visLabel = document.createElement('label')
    visLabel.textContent = 'Visibility'
    visLabel.appendChild(visBtns)
    visLabel.classList.add('visibility')

    const colorSelection = document.createElement('div')
    colorSelection.classList.add('color-selection')

    const blackSelection = document.createElement('button')
    blackSelection.classList.add('color-btn', 'black')
    blackSelection.onclick = () => createRoom('black')

    const whiteSelection = document.createElement('button')
    whiteSelection.classList.add('color-btn', 'white')
    whiteSelection.onclick = () => createRoom('white')

    const randomSelection = document.createElement('button')
    randomSelection.classList.add('color-btn', 'random')
    randomSelection.onclick = () => createRoom('random')

    colorSelection.appendChild(blackSelection)
    colorSelection.appendChild(randomSelection)
    colorSelection.appendChild(whiteSelection)

    function createRoom(color) {
        if (creating) return
        creating = true
        if (color === 'random') {
            color = Math.random() < 0.5 ? 'black' : 'white'
        }
        sessionStorage.setItem('color', color)
        socket.emit('create-room', {
            time: indexToMinutes(timeInput.value) * 60,
            rated: !!isRated,
            isPublic,
        })
    }

    const cancelBtn = document.createElement('button')
    cancelBtn.textContent = 'X'
    cancelBtn.classList.add('cancel-btn')
    cancelBtn.onclick = () => {
        createGameDiv.remove()
    }

    timeDiv.appendChild(timeLabel)
    timeDiv.appendChild(ratedLabel)
    timeDiv.appendChild(visLabel)
    timeDiv.appendChild(colorSelection)
    timeDiv.appendChild(cancelBtn)

    createGameDiv.appendChild(timeDiv)
    return createGameDiv
}

const placeholderGame = Game(gamemode.placeholder, color.white, placeholderBoard)

let game

function removeAllTiles() {
    if (board) {
        board.querySelectorAll('.tile').forEach((tile) => {
            tile.remove()
        })
    }
}

const skillTemplate = document.querySelector('#skill-level-template')
const skillDiv = document.importNode(skillTemplate.content.firstElementChild, true)
const skillLevelLabel = skillDiv.querySelector('label.skill')
const skillLevelInput = skillLevelLabel.children[1]
const skillTimeLabel = skillDiv.querySelector('label.move-time')
const skillTimeInput = skillTimeLabel.children[1]
const skillStartBtn = skillDiv.querySelector('button.start-btn')
const skillCloseBtn = skillDiv.querySelector('button.close-btn')
const skillColorBtns = skillDiv.querySelectorAll('.color-btn')

skillCloseBtn.onclick = () => {
    gamemodeDiv.querySelector('.toggle.selected').classList.remove('selected')
    skillDiv.remove()
}

skillLevelInput.oninput = () => {
    skillLevelLabel.children[0].textContent = `Skill level: ${skillLevelInput.value}`
}
skillTimeInput.oninput = () => {
    skillTimeLabel.children[0].textContent = `Thinking time: ${skillTimeInput.value}`
}

skillStartBtn.onclick = () => {
    play(true)
}

skillColorBtns.forEach((el) => {
    el.onclick = () => {
        let colorToPlay = el.classList[1]
        if (colorToPlay === 'random') {
            console.log('rand')
            colorToPlay = Math.random() < 0.5 ? color.black : color.white
        }
        play(true, colorToPlay)
    }
})

gamemodeDiv.querySelectorAll('.toggle').forEach((el) => {
    el.onclick = () => {
        gamemodeDiv.querySelectorAll('.selected').forEach((selected) => {
            selected.classList.remove('selected')
        })
        el.classList.add('selected')
        if (el.getAttribute('data-mode') === 'playerVsPlayer') {
            play(false)
        } else {
            if (el.getAttribute('data-mode') === 'playerVsComputer') {
                skillDiv.querySelector('.color-selection').classList.remove('hidden')
                skillDiv.querySelector('.start-btn').classList.add('hidden')
            } else {
                skillDiv.querySelector('.color-selection').classList.add('hidden')
                skillDiv.querySelector('.start-btn').classList.remove('hidden')
            }
            document.body.appendChild(skillDiv)
        }
    }
})

function play(setSkill = false, playerColor = color.white) {
    const selectedBtn = gamemodeDiv.querySelector('.toggle.selected')
    const mode = selectedBtn.getAttribute('data-mode')
    gamemodeDiv.parentElement.parentElement.classList.add('hidden')
    if (game) game.stop()
    game = Game(gamemode[mode] ?? gamemode.playerVsPlayer, playerColor, board)
    board.classList.toggle('flipped', playerColor === color.black)
    if (setSkill) game.setSkillLevel(+skillLevelInput.value, +skillTimeInput.value)
    skillDiv.remove()
    selectedBtn.classList.remove('selected')
    placeholderGame.stop()
    placeholderBoard.remove()
    document.body.appendChild(board)
    game.start()
}

socket.on('reset', () => {
    location.search = ''
})

socket.on('resign', (color) => {
    if (game) game.resign(color)
})

socket.on('spectator', ({ fen, gameTime, players }) => {
    waitingDiv.remove()
    placeholderGame.stop()
    placeholderBoard.remove()
    removeAllTiles()
    if (game) game.stop()
    game = Game(
        gamemode.spectator,
        playerColor,
        board,
        socket,
        +gameTime,
        { fen },
        undefined,
        players,
    )
    document.body.appendChild(board)
    game.start()
})

socket.on('start', ({ gameTime, players }) => {
    waitingDiv.remove()
    placeholderGame.stop()
    placeholderBoard.remove()
    removeAllTiles()
    if (game) game.stop()
    game = Game(
        gamemode.multiplayer,
        playerColor,
        board,
        socket,
        +gameTime,
        undefined,
        undefined,
        players,
    )
    document.body.appendChild(board)
    game.start()
})

socket.on('invalid-move', () => {
    alert('invalid')
})

socket.on('move', ({ from, to }) => {
    game.movePiece(from, to)
})

const joinBtn = document.querySelector('div.play button.join-room')
const joinTemplate = document.querySelector('#join-template')

joinBtn.onclick = async () => {
    const joinDiv = document.importNode(joinTemplate.content.firstElementChild, true)
    const table = joinDiv.querySelector('table')
    const cancelBtn = joinDiv.querySelector('button.cancel-btn')
    cancelBtn.onclick = () => {
        joinDiv.remove()
    }
    document.body.appendChild(joinDiv)
    const rooms = await getRooms()
    for (const room of rooms) {
        const row = document.createElement('tr')

        const player = document.createElement('td')
        const elo = document.createElement('td')
        const time = document.createElement('td')
        const join = document.createElement('td')

        const aJoin = document.createElement('a')

        player.textContent = room.player.username
        elo.textContent = room.player.elo
        time.textContent = +room.time / 60 + ' m'
        aJoin.href = `?r=${room.roomId}`
        aJoin.textContent = 'Join'
        join.appendChild(aJoin)

        row.onclick = () => {
            location.href = aJoin.href
        }

        row.appendChild(player)
        row.appendChild(elo)
        row.appendChild(time)
        row.appendChild(join)

        table.appendChild(row)
    }
}

function getRooms() {
    return new Promise((resolve, reject) => {
        socket.on('get-rooms', (rooms) => {
            resolve(rooms)
        })
        socket.emit('get-rooms')
    })
}

if (!urlParams.has('r')) {
    socket.on('match-found', (roomId) => {
        location.href = `?r=${roomId}`
    })
    document.querySelector('.find-room').onclick = () => {
        if (!document.querySelector('.finding-game')) createFindingDiv()
    }
    function createFindingDiv() {
        const template = document.querySelector('#find-game-template')
        const div = document.importNode(template.content.firstElementChild, true)
        div.querySelector('.close-btn').onclick = () => {
            socket.emit('find-room-cancel')
            div.remove()
        }
        document.body.appendChild(div)
        setTimeout(() => {
            socket.emit('find-room')
        }, 500)
    }
}
