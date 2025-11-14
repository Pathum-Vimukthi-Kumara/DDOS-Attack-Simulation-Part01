// Stockfish fallback handling for SharedArrayBuffer issues
// This module provides graceful degradation when SharedArrayBuffer is unavailable

class StockfishManager {
    constructor() {
        this.worker = null;
        this.ready = false;
        this.callbacks = new Map();
        this.messageId = 0;
        this.sharedArrayBufferSupported = typeof SharedArrayBuffer !== 'undefined';
        
        if (!this.sharedArrayBufferSupported) {
            console.warn('SharedArrayBuffer not supported - Stockfish will run in single-threaded mode');
            this.showFallbackMessage();
        }
    }

    showFallbackMessage() {
        // Show a brief notification that chess engine is running in basic mode
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f39c12;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 1000;
            max-width: 300px;
        `;
        notification.textContent = 'Chess engine running in basic mode (no multi-threading)';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.transition = 'opacity 0.5s';
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 500);
            }
        }, 3000);
    }

    async initialize() {
        try {
            // Load Stockfish even without SharedArrayBuffer support
            this.worker = new Worker('/stockfish/stockfish.js');
            
            this.worker.onmessage = (event) => {
                this.handleMessage(event.data);
            };

            this.worker.onerror = (error) => {
                console.warn('Stockfish worker error (expected in basic mode):', error.message);
                this.ready = false;
            };

            // Give it a moment to initialize
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.ready = true;
            
        } catch (error) {
            console.warn('Stockfish initialization failed, chess will work without engine analysis:', error.message);
            this.ready = false;
        }
    }

    handleMessage(data) {
        // Handle Stockfish responses
        console.log('Stockfish response:', data);
    }

    sendCommand(command) {
        if (this.worker && this.ready) {
            try {
                this.worker.postMessage(command);
            } catch (error) {
                console.warn('Failed to send command to Stockfish:', error.message);
            }
        } else {
            console.log('Stockfish not ready, command ignored:', command);
        }
    }

    terminate() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
            this.ready = false;
        }
    }
}

// Export for use in other modules
window.StockfishManager = StockfishManager;