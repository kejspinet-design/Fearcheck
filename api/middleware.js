/**
 * Middleware для серверных API эндпоинтов
 * CORS, Rate Limiting, Валидация
 */

const config = require('./config');

// Rate limiting хранилище
const rateLimitStore = new Map();

/**
 * CORS middleware
 */
function corsMiddleware(req, res) {
    const origin = req.headers.origin;
    
    // Проверка origin
    if (origin && config.CORS.ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', config.CORS.ALLOWED_ORIGINS[0]);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    // Обработка preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return true;
    }
    
    return false;
}

/**
 * Rate limiting middleware
 */
function rateLimitMiddleware(req, res) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Получаем историю запросов для этого IP
    if (!rateLimitStore.has(ip)) {
        rateLimitStore.set(ip, []);
    }
    
    const requests = rateLimitStore.get(ip);
    
    // Удаляем старые запросы
    const validRequests = requests.filter(time => 
        now - time < config.RATE_LIMIT.WINDOW_MS
    );
    
    // Проверка лимита
    if (validRequests.length >= config.RATE_LIMIT.MAX_REQUESTS) {
        res.status(429).json({
            error: 'Too many requests',
            retryAfter: Math.ceil(config.RATE_LIMIT.WINDOW_MS / 1000)
        });
        return true;
    }
    
    // Добавляем текущий запрос
    validRequests.push(now);
    rateLimitStore.set(ip, validRequests);
    
    // Очистка старых записей (каждые 5 минут)
    if (Math.random() < 0.01) {
        cleanupRateLimitStore();
    }
    
    return false;
}

/**
 * Очистка rate limit хранилища
 */
function cleanupRateLimitStore() {
    const now = Date.now();
    for (const [ip, requests] of rateLimitStore.entries()) {
        const validRequests = requests.filter(time => 
            now - time < config.RATE_LIMIT.WINDOW_MS
        );
        if (validRequests.length === 0) {
            rateLimitStore.delete(ip);
        } else {
            rateLimitStore.set(ip, validRequests);
        }
    }
}

/**
 * Валидация Steam ID
 */
function validateSteamId(steamId) {
    if (!steamId) return false;
    return config.VALIDATION.STEAM_ID_PATTERN.test(String(steamId));
}

/**
 * Валидация IP адреса
 */
function validateIp(ip) {
    if (!ip) return false;
    return config.VALIDATION.IP_PATTERN.test(String(ip));
}

/**
 * Обработка ошибок
 */
function handleError(res, error, statusCode = 500) {
    console.error('[API Error]', error);
    res.status(statusCode).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
}

/**
 * Безопасный fetch с таймаутом
 */
async function safeFetch(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

module.exports = {
    corsMiddleware,
    rateLimitMiddleware,
    validateSteamId,
    validateIp,
    handleError,
    safeFetch
};
