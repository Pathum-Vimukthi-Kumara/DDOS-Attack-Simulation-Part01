// Stockfish initialization helper with SharedArrayBuffer fallback
// Include this script before loading stockfish.js to ensure proper initialization

(function() {
    'use strict';
    
    // Check SharedArrayBuffer support
    const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
    
    if (!hasSharedArrayBuffer) {
        console.log('SharedArrayBuffer not available - Stockfish will run in compatibility mode');
        
        // Show a brief notification to users
        function showCompatibilityNotification() {
            const notification = document.createElement('div');
            notification.id = 'stockfish-compat-notice';
            notification.style.cssText = `
                position: fixed;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                background: #3498db;
                color: white;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 13px;
                z-index: 10000;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                max-width: 90%;
                text-align: center;
            `;
            notification.textContent = 'Chess engine in basic mode (limited features)';
            
            if (document.body) {
                document.body.appendChild(notification);
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    document.body.appendChild(notification);
                });
            }
            
            // Auto-hide after 4 seconds
            setTimeout(() => {
                if (document.getElementById('stockfish-compat-notice')) {
                    notification.style.transition = 'opacity 0.5s ease';
                    notification.style.opacity = '0';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 500);
                }
            }, 4000);
        }
        
        // Only show notification if we're in a browser environment
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            showCompatibilityNotification();
        }
    }
    
    // Enhanced error handling for Stockfish
    window.addEventListener('error', function(event) {
        if (event.filename && event.filename.includes('stockfish.js')) {
            console.log('Stockfish error caught and handled:', event.message);
            event.preventDefault(); // Prevent the error from breaking the page
            return true;
        }
    });
    
    // Override console.error temporarily to catch and handle Stockfish errors gracefully
    const originalConsoleError = console.error;
    console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('SharedArrayBuffer') || message.includes('pthreads')) {
            console.warn('Stockfish threading error (handled):', message);
            return; // Don't show the error
        }
        originalConsoleError.apply(console, args);
    };
    
    // Restore original console.error after a delay
    setTimeout(() => {
        console.error = originalConsoleError;
    }, 5000);
    
})();