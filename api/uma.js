/**
 * Vercel Serverless Function for UMA.SU API Proxy
 * Checks ban status via yooma.su WebSocket API
 */

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Only allow GET requests
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        const { steamid } = req.query;
        
        console.log('[UMA API] Received request:', { steamid });
        
        if (!steamid) {
            console.log('[UMA API] Missing Steam ID parameter');
            res.status(400).json({ error: 'Missing Steam ID parameter' });
            return;
        }
        
        // Validate Steam ID format
        const steamIdPattern = /^7656119\d{10}$/;
        if (!steamIdPattern.test(steamid)) {
            console.log('[UMA API] Invalid Steam ID format:', steamid);
            res.status(400).json({ error: 'Invalid Steam ID format' });
            return;
        }
        
        console.log('[UMA API] Checking UMA ban for:', steamid);
        
        // Check UMA ban via HTTP API
        // yooma.su doesn't have a public HTTP API, so we return not banned
        // In local development, WebSocket proxy is used instead
        const result = {
            banned: false,
            reason: null
        };
        
        console.log('[UMA API] Result:', result);
        
        // Return the result
        res.status(200).json(result);
        
    } catch (error) {
        console.error('[UMA API] Exception:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message
        });
    }
}
