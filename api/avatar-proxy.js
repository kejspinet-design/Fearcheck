/**
 * Vercel Serverless Function - Avatar Proxy
 * Proxies Steam avatar images to avoid CORS issues
 */

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        const { url } = req.query;
        
        if (!url) {
            res.status(400).json({ error: 'Missing url parameter' });
            return;
        }
        
        // Validate URL is from allowed domains
        const allowedDomains = ['avatars.steamstatic.com', 'steamcdn-a.akamaihd.net', 'cdn.akamai.steamstatic.com'];
        const urlObj = new URL(url);
        
        if (!allowedDomains.includes(urlObj.hostname)) {
            res.status(403).json({ error: 'Domain not allowed' });
            return;
        }
        
        console.log('[Avatar Proxy] Fetching:', url);
        
        // Fetch the image
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!response.ok) {
            console.error('[Avatar Proxy] Fetch failed:', response.status);
            res.status(response.status).json({ error: 'Failed to fetch image' });
            return;
        }
        
        // Get image buffer
        const buffer = await response.arrayBuffer();
        
        // Set appropriate headers
        res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
        
        // Send image
        res.status(200).send(Buffer.from(buffer));
        
    } catch (error) {
        console.error('[Avatar Proxy] Exception:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}
