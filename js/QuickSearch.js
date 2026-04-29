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
            // Check Fear only
            const fearResult = await this.checkFearBan(steamId);
            
            // Render results
            this.renderResults(steamId, fearResult);
            
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
            console.log('[QuickSearch] Checking Fear API for:', steamId);
            
            // Use proxy endpoint with correct path
            // Use Vercel serverless function
            const apiUrl = `/api/fear?q=${encodeURIComponent(steamId)}&page=1&limit=10&type=1`;
            
            console.log('[QuickSearch] Requesting:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                console.error('[QuickSearch] Fear API error:', response.status, response.statusText);
                return { 
                    banned: false, 
                    reason: `Ошибка API (${response.status})`, 
                    error: true 
                };
            }
            
            const data = await response.json();
            console.log('[QuickSearch] Fear API response:', data);
            
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
    renderResults(steamId, fearResult) {
        // Determine overall status
        const isBanned = fearResult.banned;
        
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
                </div>
            </div>
        `;
        
        // Re-enable button
        this.searchButton.disabled = false;
        
        console.info('[QuickSearch] Results rendered');
    }
}
