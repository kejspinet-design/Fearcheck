/**
 * Конфигурация для серверных API эндпоинтов
 * Хранит секреты безопасно на сервере
 */

module.exports = {
    // Fear API конфигурация
    FEAR_API: {
        BASE_URL: 'https://api.fearproject.ru',
        ACCESS_TOKEN: process.env.FEAR_ACCESS_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiI3NjU2MTE5OTUyNDc4MDMyNyIsImlhdCI6MTc4MTUyMDQwNCwiZXhwIjoxNzg0MTEyNDA0fQ.mRPdNR_NwLZA4n3SaQaJZR2n2CVa7-PEuG1zDaBAKCc'
    },

    // Steam API конфигурация
    STEAM_API: {
        KEY: process.env.STEAM_API_KEY || '4CE8017CEC2702E4A9200A4BAD93513E',
        BASE_URL: 'https://api.steampowered.com'
    },

    // UMA API конфигурация
    UMA_API: {
        BASE_URL: 'https://yooma.su/api/public/read/punishments'
    },

    // Rate limiting конфигурация
    RATE_LIMIT: {
        WINDOW_MS: 60000, // 1 минута
        MAX_REQUESTS: 30
    },

    // CORS конфигурация
    CORS: {
        ALLOWED_ORIGINS: [
            'https://reafsavers.vercel.app',
            'https://fearprotection.vercel.app',
            'http://localhost:3000'
        ]
    },

    // Валидация
    VALIDATION: {
        STEAM_ID_PATTERN: /^7656119\d{10}$/,
        IP_PATTERN: /^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?$/
    }
};
