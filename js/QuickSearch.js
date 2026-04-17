/**
 * QuickSearch class for checking single Steam ID bans
 */
class QuickSearch {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.searchInput = null;
        this.searchButton = null;
        this.resultContainer = null;
        
        this.init();
    }

    /**
     * Initialize quick search
     */
    init() {
        this.searchInput = document.getElementById('quickSearchInput');
        this.searchButton = document.getElementById('quickSearchButton');
        this.resultContainer = document.getElementById('quickSearchResult');
        
        if (!this.searchInput || !this.searchButton || !this.resultContainer) {
            console.error('[QuickSearch] Required elements not found');
            return;
        }
        
        // Bind events
        this.bindEvents();
        
        console.info('[QuickSearch] Initialized');
    }

    /**
     * Bind search events
     */
    bindEvents() {
        // Search button click
        this.searchButton.addEventListener('click', () => {
            this.handleSearch();
        });
        
        // Enter key in input
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
    }

    /**
     * Handle search action
     */
    async handleSearch() {
        const steamId = this.searchInput.value.trim();
        
        // Validate Steam ID format (17 digits starting with 7656119)
        if (!this.validateSteamId(steamId)) {
            this.showError('Неверный формат Steam ID. Введите 17-значный Steam ID (например: 76561199881908264)');
            return;
        }
        
        console.info('[QuickSearch] Searching for:', steamId);
        
        // Show loading state
        this.showLoading();
        
        try {
            // Check Fear and UMA in parallel
            const [fearResult, umaResult] = await Promise.all([
                this.checkFearBan(steamId),
                this.checkUmaBan(steamId)
            ]);
            
            // Render results
            this.renderResults(steamId, fearResult, umaResult);
            
        } catch (error) {
            console.error('[QuickSearch] Search error:', error);
            this.showError('Ошибка при проверке. Попробуйте снова.');
        }
    }

    /**
     * Validate Steam ID format
     */
    validateSteamId(steamId) {
        // Must be 17 digits starting with 7656119
        const pattern = /^7656119\d{10}$/;
        return pattern.test(steamId);
    }

    /**
     * Check Fear ban status
     */
    async checkFearBan(steamId) {
        try {
            const response = await fetch(`${this.apiClient.config.fearApiBase}/punishments/search?q=${steamId}&page=1&limit=10&type=1`, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                console.warn(`[QuickSearch] Fear API returned ${response.status}`);
                return { banned: false, reason: 'Не забанен', error: false };
            }
            
            const data = await response.json();
            
            // Check if any active bans found
            if (data && data.punishments && Array.isArray(data.punishments) && data.punishments.length > 0) {
                const ban = data.punishments[0];
                const status = ban.status; // 1 = active, 0 = expired
                
                if (status === 1) {
                    return {
                        banned: true,
                        reason: ban.reason || 'Забанен',
                        error: false
                    };
                } else {
                    return {
                        banned: false,
                        reason: 'Бан истек',
                        error: false
                    };
                }
            } else {
                return { banned: false, reason: 'Не забанен', error: false };
            }
        } catch (error) {
            console.error('[QuickSearch] Fear API error:', error);
            return { banned: false, reason: 'Ошибка проверки', error: true };
        }
    }

    /**
     * Check UMA.SU ban status via WebSocket
     */
    async checkUmaBan(steamId) {
        return new Promise((resolve) => {
            try {
                const ws = new WebSocket('wss://yooma.su/api');
                
                const timeout = setTimeout(() => {
                    ws.close();
                    resolve({ banned: false, reason: 'Таймаут соединения', error: true });
                }, 10000);
                
                let requestSent = false;
                
                ws.onopen = () => {
                    console.info('[QuickSearch] UMA.SU WebSocket connected');
                };
                
                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        
                        // Server sends get_type first
                        if (data.type === 'get_type' && !requestSent) {
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
                        
                        // Ignore page count response
                        if (data.type === 'get_punishments_pages') {
                            return;
                        }
                        
                        // Check punishments response
                        if (data.type === 'get_punishments' && data.punishments) {
                            clearTimeout(timeout);
                            
                            if (Array.isArray(data.punishments) && data.punishments.length > 0) {
                                const ban = data.punishments[0];
                                const expires = ban.expires;
                                const now = Math.floor(Date.now() / 1000);
                                
                                if (expires > now) {
                                    resolve({
                                        banned: true,
                                        reason: ban.reason || 'Забанен',
                                        error: false
                                    });
                                } else {
                                    resolve({
                                        banned: false,
                                        reason: 'Бан истек',
                                        error: false
                                    });
                                }
                            } else {
                                resolve({ banned: false, reason: 'Не забанен', error: false });
                            }
                            
                            ws.close();
                        }
                    } catch (error) {
                        console.error('[QuickSearch] UMA.SU parse error:', error);
                        clearTimeout(timeout);
                        resolve({ banned: false, reason: 'Ошибка парсинга', error: true });
                        ws.close();
                    }
                };
                
                ws.onerror = (error) => {
                    clearTimeout(timeout);
                    console.error('[QuickSearch] UMA.SU WebSocket error:', error);
                    resolve({ banned: false, reason: 'Ошибка соединения', error: true });
                    ws.close();
                };
                
                ws.onclose = () => {
                    clearTimeout(timeout);
                };
                
            } catch (error) {
                console.error('[QuickSearch] UMA.SU error:', error);
                resolve({ banned: false, reason: 'Ошибка проверки', error: true });
            }
        });
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.resultContainer.style.display = 'block';
        this.resultContainer.innerHTML = `
            <div class="quick-search-loading">
                <div class="processing-spinner"></div>
                <p>Проверяем игрока...</p>
            </div>
        `;
        
        // Disable button
        this.searchButton.disabled = true;
    }

    /**
     * Show error message
     */
    showError(message) {
        this.resultContainer.style.display = 'block';
        this.resultContainer.innerHTML = `
            <div class="quick-search-card" style="border-left-color: #ff4757;">
                <p style="color: #ff4757; text-align: center; margin: 0;">❌ ${message}</p>
            </div>
        `;
        
        // Re-enable button
        this.searchButton.disabled = false;
    }

    /**
     * Render search results
     */
    renderResults(steamId, fearResult, umaResult) {
        // Determine overall status
        const isBanned = fearResult.banned || umaResult.banned;
        
        this.resultContainer.style.display = 'block';
        this.resultContainer.innerHTML = `
            <div class="quick-search-card ${isBanned ? 'banned' : 'clean'}">
                <div class="quick-search-header">
                    <span class="quick-search-steamid">${steamId}</span>
                    <span class="quick-search-status ${isBanned ? 'banned' : 'clean'}">
                        ${isBanned ? '🚫 Забанен' : '✅ Чист'}
                    </span>
                </div>
                <div class="quick-search-details">
                    <div class="quick-search-detail-item">
                        <div class="quick-search-detail-label">Fear Project</div>
                        <div class="quick-search-detail-value ${fearResult.banned ? 'banned' : 'clean'}">
                            ${fearResult.banned ? '❌ ' + fearResult.reason : '✅ ' + fearResult.reason}
                        </div>
                    </div>
                    <div class="quick-search-detail-item">
                        <div class="quick-search-detail-label">UMA.SU</div>
                        <div class="quick-search-detail-value ${umaResult.banned ? 'banned' : 'clean'}">
                            ${umaResult.banned ? '❌ ' + umaResult.reason : '✅ ' + umaResult.reason}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Re-enable button
        this.searchButton.disabled = false;
        
        console.info('[QuickSearch] Results rendered');
    }
}
