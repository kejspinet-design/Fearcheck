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
    
    // Валидация Steam ID (опционально для UMA API)
    if (steamid && !validateSteamId(steamid)) {
        return res.status(400).json({ 
            error: 'Invalid Steam ID format',
            expected: '76561198XXXXXXXXXX' 
        });
    }
    
    try {
        const response = await safeFetch(
            config.UMA_API.BASE_URL,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'FearProtection/1.0'
                }
            },
            15000
        );
        
        if (!response.ok) {
            throw new Error(`UMA API returned ${response.status}`);
        }
        
        const data = await response.json();
        
        // Валидация данных
        if (!Array.isArray(data)) {
            throw new Error('Invalid response format');
        }
        
        // Фильтрация по steamid если указан
        let filteredData = data;
        if (steamid) {
            filteredData = data.filter(ban => {
                const banSteamId = String(ban.player_steam_id || '');
                const adminSteamId = String(ban.admin_steam_id || '');
                return banSteamId === steamid || adminSteamId === steamid;
            });
        }
        
        // Кэширование
        res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
        res.status(200).json(filteredData);
    } catch (error) {
        handleError(res, error, error.name === 'AbortError' ? 504 : 500);
    }
}
