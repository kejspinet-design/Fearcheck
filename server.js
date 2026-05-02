const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3002;

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Serve main page with loading screen (BEFORE static middleware!)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static files
app.use(express.static(__dirname));

// Handle preflight requests
app.options('*', (req, res) => {
    res.sendStatus(200);
});

// Proxy for Fear API to avoid CORS issues (only for local development)
if (process.env.NODE_ENV !== 'production') {
    console.log('Running in development mode with proxy');
    
    app.use('/api/fear', createProxyMiddleware({
        target: 'https://api.fearproject.ru',
        changeOrigin: true,
        pathRewrite: {
            '^/api/fear': '/punishments/search'
        },
        onProxyReq: (proxyReq, req, res) => {
            console.log(`Proxying request: ${req.method} ${req.url}`);
        },
        onError: (err, req, res) => {
            console.error('Proxy error:', err);
            res.status(500).json({ error: 'Proxy error', message: err.message });
        }
    }));

    // Proxy for Fear Player API (profile/{steamid}) to get avatar and nickname
    app.use('/api/player', createProxyMiddleware({
        target: 'https://api.fearproject.ru',
        changeOrigin: true,
        pathRewrite: (path, req) => {
            // Extract steamid from query parameters
            const steamid = req.query.steamid;
            if (steamid) {
                return `/profile/${steamid}`;
            }
            // Fallback to original path if no steamid
            return path.replace('/api/player', '/profile');
        },
        onProxyReq: (proxyReq, req, res) => {
            console.log(`Proxying player request: ${req.method} ${req.url}`);
        },
        onError: (err, req, res) => {
            console.error('Player proxy error:', err);
            res.status(500).json({ error: 'Proxy error', message: err.message });
        }
    }));
} else {
    console.log('Running in production mode - using serverless functions');
}

// Serve test page
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'test.html'));
});

// Serve loading test page
app.get('/test-loading', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-loading.html'));
});

// Serve simple loading test page
app.get('/simple', (req, res) => {
    res.sendFile(path.join(__dirname, 'index-simple.html'));
});

// Serve test simple page
app.get('/test-simple', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-simple.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Fear Protection Check Server`);
    console.log(`===========================================`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`   Network: http://localhost:${PORT}`);
    console.log(`\n📁 Serving files from: ${__dirname}`);
    console.log(`\n🔧 Features:`);
    console.log(`   ⚡ Config.vdf file checking`);
    console.log(`   ⚡ Fear Project API integration`);
    console.log(`   ⚡ Real-time progress indicator`);
    console.log(`\n📋 Available routes:`);
    console.log(`   /          - Main page`);
    console.log(`   /test      - API test page`);
    console.log(`   /health    - Health check`);
    console.log(`   /api/fear  - Fear API proxy`);
    console.log(`   /api/player - Player API proxy`);
    console.log(`\n💡 Upload a config.vdf file to test the performance!`);
    console.log(`===========================================`);
});