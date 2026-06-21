/**
 * APIClient.js - БЕЗОПАСНЫЙ клиент для Fear Protection API
 * Все ключи перемещены на сервер, используются только прокси
 */

class APIClient {
    constructor(options = {}) {
        // Определение окружения
        this.isProduction = window.location.hostname !== 'localhost' && 
                           window.location.hostname !== '127.0.0.1';
        
        // Базовый URL для API (всегда используем относительные пути - прокси на Vercel)
        this.baseUrl = '/api';
        
        // Rate limiter для клиентских запросов
        this.rateLimiter = SecurityUtils.createRateLimiter(20, 60000);
        
        console.log(`[APIClient] Environment: ${this.isProduction ? 'Production' : 'Development'}`);
        console.log(`[APIClient] API Base URL: ${this.baseUrl}`);
    }

    /**
     * Универсальный метод для запросов к API
     */
    async request(endpoint, options = {}) {
        // Проверка rate limit
        if (!this.rateLimiter()) {
            throw new Error('Too many requests. Please wait.');
        }

        const url = `${this.baseUrl}${endpoint}`;
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const finalOptions = { ...defaultOptions, ...options };

        try {
            console.log(`[APIClient] Requesting: ${url}`);
            
            const response = await fetch(url, finalOptions);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(error.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`[APIClient] Error fetching ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Получение списка серверов Fear
     */
    async fetchServers() {
        try {
            const servers = await this.request('/fear-servers');
            console.log(`[APIClient] Servers fetched: ${servers.length}`);
            return Array.isArray(servers) ? servers : [];
        } catch (error) {
            console.error('[APIClient] Error fetching servers:', error);
            return [];
        }
    }

    /**
     * Получение недавних репортов
     */
    async fetchReports() {
        try {
            const reports = await this.request('/reports-recent');
            console.log(`[APIClient] Reports fetched successfully: ${reports.length}`);
            return Array.isArray(reports) ? reports : [];
        } catch (error) {
            console.error('[APIClient] Error fetching reports:', error);
            return [];
        }
    }

    /**
     * Получение данных игрока
     */
    async fetchPlayerProfile(steamId) {
        // Валидация Steam ID на клиенте
        if (!SecurityUtils.validateSteamId(steamId)) {
            console.error('[APIClient] Invalid Steam ID format:', steamId);
            throw new Error('Invalid Steam ID format');
        }

        try {
            const profile = await this.request(`/player?steamid=${steamId}`);
            console.log(`[APIClient] Player profile fetched:`, steamId);
            return profile;
        } catch (error) {
            console.error(`[APIClient] Error fetching player ${steamId}:`, error);
            throw error;
        }
    }

    /**
     * Получение банов UMA
     */
    async fetchUmaBans(steamId = null) {
        try {
            const endpoint = steamId ? `/uma?steamid=${steamId}` : '/uma';
            const bans = await this.request(endpoint);
            console.log(`[APIClient] UMA bans fetched: ${bans.length}`);
            return Array.isArray(bans) ? bans : [];
        } catch (error) {
            console.error('[APIClient] Error fetching UMA bans:', error);
            return [];
        }
    }

    /**
     * Прокси для аватарок (через серверный эндпоинт)
     */
    getAvatarProxyUrl(originalUrl) {
        if (!originalUrl) return null;
        
        // Санитизация URL
        const sanitized = SecurityUtils.sanitizeUrl(originalUrl);
        if (!sanitized) return null;
        
        // Используем серверный прокси для аватарок
        return `/api/avatar-proxy?url=${encodeURIComponent(sanitized)}`;
    }

    /**
     * Получение аватарки Steam
     */
    async fetchSteamAvatar(steamId) {
        try {
            const profile = await this.fetchPlayerProfile(steamId);
            const avatarUrl = profile.avatar_full || profile.avatar_medium || profile.avatar;
            
            if (!avatarUrl) {
                return this.getPlaceholderAvatar(steamId);
            }
            
            return this.getAvatarProxyUrl(avatarUrl);
        } catch (error) {
            console.error('[APIClient] Error fetching avatar:', error);
            return this.getPlaceholderAvatar(steamId);
        }
    }

    /**
     * Генерация placeholder аватарки
     */
    getPlaceholderAvatar(steamId) {
        const colors = ['667eea', '764ba2', 'f093fb', 'f5576c', '4facfe', '00f2fe', '43e97b', '38f9d7', 'fa709a', 'fee140'];
        const colorIndex = steamId ? parseInt(String(steamId).slice(-2)) % colors.length : 0;
        const color = colors[colorIndex];
        const initials = steamId ? steamId.slice(-4) : '????';
        
        return `https://ui-avatars.com/api/?name=${initials}&background=${color}&color=fff&size=128&bold=true`;
    }

    /**
     * Проверка статуса API
     */
    async healthCheck() {
        try {
            const servers = await this.fetchServers();
            return {
                status: 'ok',
                serversAvailable: servers.length > 0
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message
            };
        }
    }
}

// Глобальный экспорт
if (typeof window !== 'undefined') {
    window.APIClient = APIClient;
}
