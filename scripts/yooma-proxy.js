/**
 * WebSocket proxy for yooma.su
 * Allows checking UMA bans from localhost
 */
const WebSocket = require('ws');

// Create WebSocket server on port 3003
const wss = new WebSocket.Server({ port: 3003 });

console.log('Yooma WebSocket Proxy running on ws://localhost:3003');

wss.on('connection', (clientWs) => {
    console.log('[Proxy] Client connected');
    
    // Connect to yooma.su
    const yoomaWs = new WebSocket('wss://yooma.su/api');
    
    // Forward messages from client to yooma
    clientWs.on('message', (message) => {
        console.log('[Proxy] Client -> Yooma:', message.toString());
        if (yoomaWs.readyState === WebSocket.OPEN) {
            yoomaWs.send(message);
        }
    });
    
    // Forward messages from yooma to client
    yoomaWs.on('message', (message) => {
        console.log('[Proxy] Yooma -> Client:', message.toString());
        if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(message);
        }
    });
    
    // Handle yooma connection open
    yoomaWs.on('open', () => {
        console.log('[Proxy] Connected to yooma.su');
    });
    
    // Handle errors
    yoomaWs.on('error', (error) => {
        console.error('[Proxy] Yooma error:', error);
        clientWs.close();
    });
    
    clientWs.on('error', (error) => {
        console.error('[Proxy] Client error:', error);
        yoomaWs.close();
    });
    
    // Handle close
    yoomaWs.on('close', () => {
        console.log('[Proxy] Yooma connection closed');
        clientWs.close();
    });
    
    clientWs.on('close', () => {
        console.log('[Proxy] Client disconnected');
        yoomaWs.close();
    });
});
