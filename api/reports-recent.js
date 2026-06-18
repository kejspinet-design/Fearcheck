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
        const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiI3NjU2MTE5OTUyNDc4MDMyNyIsImlhdCI6MTc4MTUyMDQwNCwiZXhwIjoxNzg0MTEyNDA0fQ.mRPdNR_NwLZA4n3SaQaJZR2n2CVa7-PEuG1zDaBAKCc';
        
        console.log('[Reports Recent] Requesting reports from Fear API...');
        
        const response = await fetch('https://api.fearproject.ru/reports/recent', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cookie': `access_token=${accessToken}`,
                'User-Agent': 'Fear-Protection-Check/1.0'
            }
        });
        
        console.log('[Reports Recent] Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Reports Recent] API error:', errorText);
            res.status(response.status).json({ error: 'Fear Reports API error', details: errorText });
            return;
        }
        
        const data = await response.json();
        console.log('[Reports Recent] Success, reports count:', Array.isArray(data) ? data.length : 'unknown');
        
        res.status(200).json(data);
    } catch (error) {
        console.error('[Reports Recent] Exception:', error);
        res.status(500).json({ error: 'Failed to fetch reports', message: error.message });
    }
}
