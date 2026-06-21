const config = require('./config');
const { corsMiddleware, rateLimitMiddleware, validateSteamId, handleError, safeFetch } = require('./middleware');

export default async function handler(req, res) {
    // CORS
    if (corsMiddleware(req, res)) return;
    
    // Rate limiting
    if (rateLimitMiddleware(req, res)) return;
    
    // Только GET запросы
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { steamid } = req.query;
    
    // Валидация Steam ID
    if (!steamid || !validateSteamId(steamid)) {
        return res.status(400).json({ 
            error: 'Invalid Steam ID format',
            expected: '76561198XXXXXXXXXX' 
        });
    }
    
    try {
        const response = await safeFetch(
            `${config.FEAR_API.BASE_URL}/profile/${steamid}`,
            {
                headers: {
                    'Cookie': `access_token=${config.FEAR_API.ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'FearProtection/1.0'
                }
            },
            15000
        );
        
        if (!response.ok) {
            if (response.status === 404) {
                return res.status(404).json({ error: 'Player not found' });
            }
            throw new Error(`Fear API returned ${response.status}`);
        }
        
        const data = await response.json();
        
        // Валидация данных
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid response format');
        }
        
        // Кэширование
        res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
        res.status(200).json(data);
    } catch (error) {
        handleError(res, error, error.name === 'AbortError' ? 504 : 500);
    }
}
