'use strict'

// Socket connection for DDoS warnings
const socket = io('/')

// DDoS Attack Warning System
let attackWarningActive = false
let attackMetrics = { rps: 0, isUnderAttack: false, threatLevel: 'normal' }

// Create attack warning overlay
function createAttackWarning(data) {
    // Remove existing warning
    const existing = document.getElementById('ddos-warning')
    if (existing) existing.remove()
    
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
}

// Socket event listeners for attack detection
socket.on('ddos-attack-detected', (data) => {
    console.log('🚨 DDoS Attack Detected:', data)
    createAttackWarning(data)
})

socket.on('ddos-attack-stopped', (data) => {
    console.log('✅ DDoS Attack Stopped:', data)
    showAttackStopped(data)
})

socket.on('attack-metrics', (data) => {
    attackMetrics = data
})

// Login form functionality
const form = document.querySelector('div.form form')
const error = document.querySelector('div.error')
const signInBtn = form.querySelector('button.submit')

let wait = false

form.onsubmit = async e => {
    e.preventDefault()
    if (wait) return
    wait = true

    signInBtn.innerHTML = '<div class="spinner white"></div>'

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: form.querySelector('input.username').value,
            password: form.querySelector('input.password').value
        })
    }

    const response = await fetch(`${location.protocol}//${location.host}/account/login`, options)
    const data = await response.json()

    if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('username', data.username)
        location.href = '../'
        return
    }

    error.textContent = data.error
    signInBtn.textContent = 'SIGN IN'
    wait = false
}