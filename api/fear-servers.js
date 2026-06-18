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
    
    try {
        const response = await fetch('https://api.fearproject.ru/servers', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Fear-Protection-Check/1.0'
            }
        });
        
        if (!response.ok) {
            console.error('[Fear Servers] API error:', response.status);
            res.status(response.status).json({ error: 'Fear API error' });
            return;
        }
        
        const data = await response.json();
        console.log('[Fear Servers] Success, servers count:', Array.isArray(data) ? data.length : 'unknown');
        
        res.status(200).json(data);
    } catch (error) {
        console.error('[Fear Servers] Exception:', error);
        res.status(500).json({ error: 'Failed to fetch servers', message: error.message });
    }
}
