/**
 * Vercel Serverless Function for Avatar Proxy
 * Proxies Steam avatars to avoid CORS issues
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
        
        // Validate URL is from Steam
        if (!url.startsWith('https://avatars.steamstatic.com/') && 
            !url.startsWith('https://steamcdn-a.akamaihd.net/')) {
            res.status(400).json({ error: 'Invalid avatar URL' });
            return;
        }
        
        console.log('[Avatar Proxy] Fetching:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!response.ok) {
            console.error('[Avatar Proxy] Failed to fetch:', response.status);
            res.status(response.status).json({ error: 'Failed to fetch avatar' });
            return;
        }
        
        // Get image data
        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        
        // Set cache headers
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400, immutable'); // Cache for 24 hours
        
        // Return image
        res.status(200).send(Buffer.from(imageBuffer));
        
    } catch (error) {
        console.error('[Avatar Proxy] Exception:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}
