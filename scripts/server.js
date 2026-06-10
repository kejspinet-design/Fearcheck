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
    
    // Proxy for Fear Servers API
    app.use('/api/fear/servers', createProxyMiddleware({
        target: 'https://api.fearproject.ru',
        changeOrigin: true,
        pathRewrite: {
            '^/api/fear/servers': '/servers'
        },
        onProxyReq: (proxyReq, req, res) => {
            console.log(`Proxying servers request: ${req.method} ${req.url}`);
        },
        onError: (err, req, res) => {
            console.error('Servers proxy error:', err);
            res.status(500).json({ error: 'Proxy error', message: err.message });
        }
    }));
    
    // Proxy for Fear Reports API
    app.use('/api/reports', createProxyMiddleware({
        target: 'https://api.fearproject.ru',
        changeOrigin: true,
        pathRewrite: {
            '^/api/reports': '/reports/recent'
        },
        onProxyReq: (proxyReq, req, res) => {
            // Add authentication cookies
            const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiI3NjU2MTE5OTUyNDc4MDMyNyIsImlhdCI6MTc3NzgwNzMyNCwiZXhwIjoxNzgwMzk5MzI0fQ.PaLsOYuO-qx0AZcEG-5aQnjdNPUzD2zHFtqVxc4RmNo';
            proxyReq.setHeader('Cookie', `access_token=${accessToken}; _ym_uid=1766660078200365881; _ym_d=1776260131; __ddg1_=faR8r5N1jJ3rGWxclyQR; __ddgid_=ZqbP2ZyzeZ2XMwTt; __ddgmark_=4RvtV5EigamE7TfU; _ym_isad=2; __ddg9_=104.28.229.14; _ym_visorc=w; __ddg10_=1777818152; __ddg8_=9pZgQJGSwSkScMhK`);
            console.log(`Proxying reports request: ${req.method} ${req.url}`);
        },
        onError: (err, req, res) => {
            console.error('Reports proxy error:', err);
            res.status(500).json({ error: 'Proxy error', message: err.message });
        }
    }));
    
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

    // Proxy for Steam API
    app.use('/api/steam', createProxyMiddleware({
        target: 'https://api.steampowered.com',
        changeOrigin: true,
        pathRewrite: {
            '^/api/steam': ''
        },
        onProxyReq: (proxyReq, req, res) => {
            console.log(`Proxying Steam API request: ${req.method} ${req.url}`);
        },
        onError: (err, req, res) => {
            console.error('Steam API proxy error:', err);
            res.status(500).json({ error: 'Proxy error', message: err.message });
        }
    }));

    // Proxy for Yooma.su API to check UMA bans (pages count)
    app.use('/api/yooma', createProxyMiddleware({
        target: 'https://yooma.su',
        changeOrigin: true,
        pathRewrite: {
            '^/api/yooma': '/api/public/read/punishments-pages'
        },
        onProxyReq: (proxyReq, req, res) => {
            // Add browser-like headers
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            proxyReq.setHeader('Accept', 'application/json, text/plain, */*');
            proxyReq.setHeader('Accept-Language', 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7');
            proxyReq.setHeader('Referer', 'https://yooma.su/');
            proxyReq.setHeader('Origin', 'https://yooma.su');
            console.log(`Proxying yooma pages request: ${req.method} ${req.url} -> ${proxyReq.path}`);
        },
        onProxyRes: (proxyRes, req, res) => {
            console.log(`Yooma pages response: ${proxyRes.statusCode}`);
        },
        onError: (err, req, res) => {
            console.error('Yooma proxy error:', err);
            res.status(500).json({ error: 'Proxy error', message: err.message });
        }
    }));

    // Proxy for Yooma.su API to get punishment details
    app.use('/api/yooma-details', createProxyMiddleware({
        target: 'https://yooma.su',
        changeOrigin: true,
        pathRewrite: {
            '^/api/yooma-details': '/api/public/read/punishments'
        },
        onProxyReq: (proxyReq, req, res) => {
            // Add browser-like headers
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            proxyReq.setHeader('Accept', 'application/json, text/plain, */*');
            proxyReq.setHeader('Accept-Language', 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7');
            proxyReq.setHeader('Referer', 'https://yooma.su/');
            proxyReq.setHeader('Origin', 'https://yooma.su');
            console.log(`Proxying yooma details request: ${req.method} ${req.url} -> ${proxyReq.path}`);
        },
        onProxyRes: (proxyRes, req, res) => {
            console.log(`Yooma details response: ${proxyRes.statusCode}`);
        },
        onError: (err, req, res) => {
            console.error('Yooma details proxy error:', err);
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
    console.log(`   /api/fear/servers - Fear Servers API proxy`);
    console.log(`   /api/reports - Fear Reports API proxy`);
    console.log(`   /api/fear  - Fear API proxy`);
    console.log(`   /api/player - Player API proxy`);
    console.log(`   /api/steam - Steam API proxy`);
    console.log(`\n💡 Upload a config.vdf file to test the performance!`);
    console.log(`===========================================`);
});