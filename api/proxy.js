/**
 * Универсальный прокси для всех Fear API запросов
 * Объединяет все эндпоинты в один файл для Vercel Hobby plan
 */

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
    
    const { endpoint, steamid, steamids, url } = req.query;
    
    try {
        switch (endpoint) {
            case 'servers':
                return await handleServers(req, res);
            
            case 'reports':
                return await handleReports(req, res);
            
            case 'player':
                return await handlePlayer(req, res, steamid);
            
            case 'player-summaries':
                return await handlePlayerSummaries(req, res, steamids);
            
            case 'uma':
                return await handleUma(req, res, steamid);
            
            case 'avatar':
                return await handleAvatar(req, res, url);
            
            default:
                return res.status(400).json({ error: 'Invalid endpoint parameter' });
        }
    } catch (error) {
        handleError(res, error);
    }
}

/**
 * Fear Servers
 */
async function handleServers(req, res) {
    const response = await safeFetch(
        `${config.FEAR_API.BASE_URL}/servers`,
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
    
    if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
    }
    
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    res.status(200).json(data);
}

/**
 * Recent Reports
 */
async function handleReports(req, res) {
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
    
    if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
    }
    
    res.setHeader('Cache-Control', 'public, max-age=10, stale-while-revalidate=30');
    res.status(200).json(data);
}

/**
 * Player Profile
 */
async function handlePlayer(req, res, steamid) {
    if (!steamid || !validateSteamId(steamid)) {
        return res.status(400).json({ 
            error: 'Invalid Steam ID format',
            expected: '76561198XXXXXXXXXX' 
        });
    }
    
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
    
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
    }
    
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.status(200).json(data);
}

/**
 * Player Summaries (batch) - Steam API
 */
async function handlePlayerSummaries(req, res, steamids) {
    if (!steamids) {
        return res.status(400).json({ error: 'steamids parameter is required' });
    }
    
    // Разбиваем строку на массив
    const idsArray = steamids.split(',').map(id => id.trim()).filter(id => id);
    
    if (idsArray.length === 0) {
        return res.status(400).json({ error: 'No valid Steam IDs provided' });
    }
    
    // Валидация всех Steam ID
    const validIds = idsArray.filter(id => validateSteamId(id));
    
    if (validIds.length === 0) {
        return res.status(400).json({ error: 'No valid Steam IDs provided' });
    }
    
    // Steam API поддерживает до 100 ID за раз
    const batchSize = 100;
    const batches = [];
    for (let i = 0; i < validIds.length; i += batchSize) {
        batches.push(validIds.slice(i, i + batchSize));
    }
    
    try {
        const allPlayers = [];
        
        for (const batch of batches) {
            const steamIdsParam = batch.join(',');
            const response = await safeFetch(
                `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${config.STEAM_API.KEY}&steamids=${steamIdsParam}`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'FearProtection/1.0'
                    }
                },
                15000
            );
            
            if (!response.ok) {
                throw new Error(`Steam API returned ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.response && data.response.players) {
                allPlayers.push(...data.response.players);
            }
        }
        
        res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
        res.status(200).json(allPlayers);
    } catch (error) {
        handleError(res, error);
    }
}

/**
 * UMA Bans
 */
async function handleUma(req, res, steamid) {
    if (steamid && !validateSteamId(steamid)) {
        return res.status(400).json({ 
            error: 'Invalid Steam ID format',
            expected: '76561198XXXXXXXXXX' 
        });
    }
    
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
    
    if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
    }
    
    let filteredData = data;
    if (steamid) {
        filteredData = data.filter(ban => {
            const banSteamId = String(ban.player_steam_id || '');
            const adminSteamId = String(ban.admin_steam_id || '');
            return banSteamId === steamid || adminSteamId === steamid;
        });
    }
    
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.status(200).json(filteredData);
}

/**
 * Avatar Proxy
 */
async function handleAvatar(req, res, url) {
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }
    
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
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
            return res.status(400).json({ error: 'Invalid content type' });
        }
        
        const buffer = await response.arrayBuffer();
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.status(200).send(Buffer.from(buffer));
    } catch (error) {
        handleError(res, error, 500);
    }
}
