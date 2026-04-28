const WebSocket = require('ws');

/**
 * Serverless function to check UMA.SU ban via WebSocket
 */
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Get Steam ID from query parameter
    const steamId = req.query.steamId;
    
    if (!steamId) {
        res.status(400).json({ error: 'Steam ID is required', banned: false, reason: 'Ошибка запроса' });
        return;
    }
    
    try {
        const result = await checkUmaBan(steamId);
        res.status(200).json(result);
    } catch (error) {
        console.error('UMA check error:', error);
        res.status(500).json({ banned: false, reason: 'Ошибка проверки', error: true });
    }
};

/**
 * Check UMA.SU ban via WebSocket
 */
function checkUmaBan(steamId) {
    return new Promise((resolve) => {
        let ws = null;
        let isResolved = false;
        
        const resolveOnce = (result) => {
            if (!isResolved) {
                isResolved = true;
                if (ws) {
                    try {
                        ws.close();
                    } catch (e) {
                        // Ignore
                    }
                }
                resolve(result);
            }
        };
        
        try {
            ws = new WebSocket('wss://yooma.su/api');
            
            const timeout = setTimeout(() => {
                resolveOnce({ banned: false, reason: 'Таймаут', error: true });
            }, 5000);
            
            let requestSent = false;
            
            ws.on('open', () => {
                // Connection opened
            });
            
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    
                    if (message.type === 'get_type' && !requestSent) {
                        requestSent = true;
                        
                        const request = {
                            type: 'get_punishments',
                            page: 1,
                            punish_type: 0,
                            search: steamId
                        };
                        
                        ws.send(JSON.stringify(request));
                        return;
                    }
                    
                    if (message.type === 'get_punishments_pages') {
                        return;
                    }
                    
                    if (message.type === 'get_punishments' && message.punishments) {
                        clearTimeout(timeout);
                        
                        if (Array.isArray(message.punishments) && message.punishments.length > 0) {
                            const ban = message.punishments[0];
                            const reason = ban.reason || 'Забанен';
                            const expires = ban.expires;
                            const now = Math.floor(Date.now() / 1000);
                            
                            if (expires > now) {
                                resolveOnce({ banned: true, reason: reason, error: false });
                            } else {
                                resolveOnce({ banned: false, reason: 'Бан истек', error: false });
                            }
                        } else {
                            resolveOnce({ banned: false, reason: 'Не забанен', error: false });
                        }
                    }
                } catch (error) {
                    console.error('Parse error:', error);
                    clearTimeout(timeout);
                    resolveOnce({ banned: false, reason: 'Ошибка парсинга', error: true });
                }
            });
            
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                clearTimeout(timeout);
                resolveOnce({ banned: false, reason: 'Ошибка соединения', error: true });
            });
            
            ws.on('close', () => {
                clearTimeout(timeout);
                if (!isResolved) {
                    resolveOnce({ banned: false, reason: 'Соединение закрыто', error: true });
                }
            });
            
        } catch (error) {
            console.error('Error:', error);
            resolveOnce({ banned: false, reason: 'Ошибка проверки', error: true });
        }
    });
}
