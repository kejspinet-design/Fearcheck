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
    
    const { url } = req.query;
    
    // Валидация URL
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    // Проверка доменов
    const allowedDomains = [
        'steamstatic.com',
        'avatars.steamstatic.com',
        'ui-avatars.com'
    ];
    
    try {
        const parsedUrl = new URL(url);
        const isAllowed = allowedDomains.some(domain =>
            parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
        );
        
        if (!isAllowed) {
            return res.status(403).json({ error: 'Domain not allowed' });
        }
        
        const response = await safeFetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'FearProtection/1.0'
            }
        }, 10000);
        
        if (!response.ok) {
            throw new Error(`Avatar fetch failed: ${response.status}`);
        }
        
        // Проверка типа контента
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
            return res.status(400).json({ error: 'Invalid content type' });
        }
        
        const buffer = await response.arrayBuffer();
        
        // Отправка изображения
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 часа
        res.status(200).send(Buffer.from(buffer));
    } catch (error) {
        handleError(res, error, 500);
    }
}
