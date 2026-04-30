const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3001; // Different port from main app

// Serve static files
app.use(express.static(__dirname));

// Proxy for Fear API to avoid CORS issues
app.use('/api/fear', createProxyMiddleware({
    target: 'https://api.fearproject.ru',
    changeOrigin: true,
    pathRewrite: {
        '^/api/fear': ''
    },
    onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Proxy error' });
    }
}));

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Check Page Server running at:`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`   Network: http://localhost:${PORT}`);
    console.log(`\n📁 Serving files from: ${__dirname}`);
    console.log(`\n🔧 Features:`);
    console.log(`   ⚡ Parallel Fear API requests (50 per batch)`);
    console.log(`   ⚡ Duplicate Steam ID caching`);
    console.log(`   ⚡ Real-time progress indicator`);
    console.log(`\n💡 Upload a config.vdf file to test the performance!`);
});