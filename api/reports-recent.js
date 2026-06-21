const config = require('./config');
const { corsMiddleware, rateLimitMiddleware, handleError, safeFetch } = require('./middleware');

export default async function handler(req, res) {
    // CORS
    if (corsMiddleware(req, res)) return;
    
    // Rate limiting
    if (rateLimitMiddleware(req, res)) return;
    
    // Только GET запросы
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const response = await safeFetch(
            `${config.FEAR_API.BASE_URL}/reports/recent`,
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
            throw new Error(`Fear API returned ${response.status}`);
        }
        
        const data = await response.json();
        
        // Валидация данных
        if (!Array.isArray(data)) {
            throw new Error('Invalid response format');
        }
        
        // Кэширование
        res.setHeader('Cache-Control', 'public, max-age=10, stale-while-revalidate=30');
        res.status(200).json(data);
    } catch (error) {
        handleError(res, error, error.name === 'AbortError' ? 504 : 500);
    }
}
