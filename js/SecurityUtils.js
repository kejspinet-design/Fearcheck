/**
 * SecurityUtils.js - Утилиты безопасности для Fear Protection
 * Защита от XSS, инъекций, валидация данных
 */

class SecurityUtils {
    /**
     * Экранирование HTML для предотвращения XSS
     */
    static sanitizeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        return String(text).replace(/[&<>"'`=/]/g, char => map[char]);
    }

    /**
     * Проверка и санитизация URL
     */
    static sanitizeUrl(url) {
        if (!url) return '';
        
        const defaultAvatar = 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg';
        const allowedProtocols = ['http:', 'https:', 'data:'];
        const allowedDomains = [
            'steamstatic.com',
            'avatars.steamstatic.com',
            'ui-avatars.com',
            'fearproject.ru',
            'reafsavers.vercel.app'
        ];

        try {
            const parsed = new URL(url);
            
            // Проверка протокола
            if (!allowedProtocols.includes(parsed.protocol)) {
                console.warn('[Security] Blocked URL with invalid protocol:', url);
                return defaultAvatar;
            }

            // Для data: URLs проверяем тип
            if (parsed.protocol === 'data:') {
                if (!url.startsWith('data:image/')) {
                    console.warn('[Security] Blocked non-image data URL');
                    return defaultAvatar;
                }
                return url;
            }

            // Проверка домена
            const isAllowedDomain = allowedDomains.some(domain => 
                parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
            );

            if (!isAllowedDomain) {
                console.warn('[Security] Blocked URL from untrusted domain:', parsed.hostname);
                return defaultAvatar;
            }

            return url;
        } catch (error) {
            console.warn('[Security] Invalid URL format:', url);
            return defaultAvatar;
        }
    }

    /**
     * Валидация Steam ID
     */
    static validateSteamId(steamId) {
        if (!steamId) return false;
        const steamIdPattern = /^7656119\d{10}$/;
        return steamIdPattern.test(String(steamId));
    }

    /**
     * Валидация IP адреса
     */
    static validateIpAddress(ip) {
        if (!ip) return false;
        const ipPattern = /^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?$/;
        return ipPattern.test(String(ip));
    }

    /**
     * Создание безопасного элемента с текстом
     */
    static createTextElement(tag, text, className = '') {
        const element = document.createElement(tag);
        element.textContent = text;
        if (className) element.className = className;
        return element;
    }

    /**
     * Создание безопасного изображения
     */
    static createImageElement(src, alt = '', className = '') {
        const img = document.createElement('img');
        img.src = this.sanitizeUrl(src);
        img.alt = this.sanitizeHtml(alt);
        if (className) img.className = className;
        
        // Обработка ошибок загрузки
        img.onerror = () => {
            img.src = 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg';
        };
        
        return img;
    }

    /**
     * Безопасная вставка HTML (для контролируемого контента)
     */
    static setInnerHTML(element, html) {
        // Создаём временный div для парсинга
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Удаляем опасные элементы и атрибуты
        const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link'];
        const dangerousAttrs = ['onclick', 'onerror', 'onload', 'onmouseover'];
        
        dangerousTags.forEach(tag => {
            temp.querySelectorAll(tag).forEach(el => el.remove());
        });
        
        temp.querySelectorAll('*').forEach(el => {
            dangerousAttrs.forEach(attr => {
                if (el.hasAttribute(attr)) {
                    el.removeAttribute(attr);
                }
            });
            
            // Проверка href и src
            if (el.hasAttribute('href')) {
                el.href = this.sanitizeUrl(el.getAttribute('href'));
            }
            if (el.hasAttribute('src')) {
                el.src = this.sanitizeUrl(el.getAttribute('src'));
            }
        });
        
        element.innerHTML = temp.innerHTML;
    }

    /**
     * Шифрование данных для localStorage (простое XOR)
     */
    static encryptData(data, key = 'fear_protection_2026') {
        try {
            const text = JSON.stringify(data);
            let encrypted = '';
            for (let i = 0; i < text.length; i++) {
                encrypted += String.fromCharCode(
                    text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                );
            }
            return btoa(encrypted);
        } catch (error) {
            console.error('[Security] Encryption failed:', error);
            return null;
        }
    }

    /**
     * Расшифровка данных из localStorage
     */
    static decryptData(encrypted, key = 'fear_protection_2026') {
        try {
            const text = atob(encrypted);
            let decrypted = '';
            for (let i = 0; i < text.length; i++) {
                decrypted += String.fromCharCode(
                    text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                );
            }
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('[Security] Decryption failed:', error);
            return null;
        }
    }

    /**
     * Безопасное сохранение в localStorage
     */
    static saveToLocalStorage(key, data, encrypt = false) {
        try {
            const value = encrypt ? this.encryptData(data) : JSON.stringify(data);
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.error('[Security] Failed to save to localStorage:', error);
            return false;
        }
    }

    /**
     * Безопасное чтение из localStorage
     */
    static loadFromLocalStorage(key, encrypted = false) {
        try {
            const value = localStorage.getItem(key);
            if (!value) return null;
            
            return encrypted ? this.decryptData(value) : JSON.parse(value);
        } catch (error) {
            console.error('[Security] Failed to load from localStorage:', error);
            return null;
        }
    }

    /**
     * Rate limiting для клиентских запросов
     */
    static createRateLimiter(maxRequests = 10, timeWindow = 60000) {
        const requests = [];
        
        return function() {
            const now = Date.now();
            
            // Удаляем старые запросы
            while (requests.length > 0 && requests[0] < now - timeWindow) {
                requests.shift();
            }
            
            // Проверка лимита
            if (requests.length >= maxRequests) {
                console.warn('[Security] Rate limit exceeded');
                return false;
            }
            
            requests.push(now);
            return true;
        };
    }

    /**
     * Безопасное копирование в буфер обмена
     */
    static async copyToClipboard(text) {
        try {
            const sanitized = this.sanitizeHtml(text);
            await navigator.clipboard.writeText(sanitized);
            return true;
        } catch (error) {
            console.error('[Security] Failed to copy to clipboard:', error);
            return false;
        }
    }

    /**
     * Проверка на SQL injection паттерны
     */
    static detectSqlInjection(input) {
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
            /(--|;|\/\*|\*\/|xp_|sp_)/gi,
            /(\bOR\b.*=.*|'\s*OR\s*'.*=.*)/gi
        ];
        
        return sqlPatterns.some(pattern => pattern.test(String(input)));
    }

    /**
     * Генерация nonce для CSP
     */
    static generateNonce() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode.apply(null, array));
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityUtils;
}
