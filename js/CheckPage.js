/**
 * CheckPage class for managing the check page
 */
class CheckPage {
    constructor() {
        this.apiClient = new APIClient({
            steamApiKey: 'E060AF2E30A53F487CD115E1067F9983',
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiI3NjU2MTE5OTUyNDc4MDMyNyIsImlhdCI6MTc3NjI2MzY4MiwiZXhwIjoxNzc4ODU1NjgyfQ.TdgSNRkzoVN2a7ysy4QPNcv7S_wFQ9WpiPwcb6C2D84',
            cookieDomain: '.fearproject.ru'
        });
        
        this.modalManager = new ModalManager();
        this.configChecker = new ConfigChecker(this.apiClient);
        this.quickSearch = new QuickSearch(this.apiClient);
        this.searchHistory = [];
        
        this.init();
    }

    /**
     * Initialize check page
     */
    init() {
        console.info('[CheckPage] Initialized');
        
        // Load search history from localStorage
        this.loadSearchHistory();
        
        // Listen for search completion
        this.setupSearchListener();
    }

    /**
     * Setup search listener to save to history
     */
    setupSearchListener() {
        const originalRenderResults = this.quickSearch.renderResults.bind(this.quickSearch);
        
        this.quickSearch.renderResults = (steamId, fearResult) => {
            // Call original render
            originalRenderResults(steamId, fearResult);
            
            // Add to history
            this.addToHistory(steamId, fearResult);
        };
    }

    /**
     * Add search result to history
     */
    addToHistory(steamId, fearResult) {
        const isBanned = fearResult.banned;
        
        const historyItem = {
            steamId: steamId,
            timestamp: Date.now(),
            fearBanned: fearResult.banned,
            isBanned: isBanned
        };
        
        // Add to beginning of array
        this.searchHistory.unshift(historyItem);
        
        // Keep only last 10 searches
        if (this.searchHistory.length > 10) {
            this.searchHistory = this.searchHistory.slice(0, 10);
        }
        
        // Save to localStorage
        this.saveSearchHistory();
        
        // Render history
        this.renderHistory();
    }

    /**
     * Load search history from localStorage
     */
    loadSearchHistory() {
        try {
            const saved = localStorage.getItem('fearProtectionSearchHistory');
            if (saved) {
                this.searchHistory = JSON.parse(saved);
                this.renderHistory();
            }
        } catch (error) {
            console.error('[CheckPage] Error loading history:', error);
        }
    }

    /**
     * Save search history to localStorage
     */
    saveSearchHistory() {
        try {
            localStorage.setItem('fearProtectionSearchHistory', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.error('[CheckPage] Error saving history:', error);
        }
    }

    /**
     * Render search history
     */
    renderHistory() {
        const historyContainer = document.getElementById('search-history');
        const countElement = document.getElementById('historyCount');
        
        if (!historyContainer) return;
        
        // Update count
        if (countElement) {
            countElement.textContent = this.searchHistory.length;
        }
        
        // Clear container
        historyContainer.innerHTML = '';
        
        if (this.searchHistory.length === 0) {
            historyContainer.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p>История проверок пуста</p>
                </div>
            `;
            return;
        }
        
        // Render each history item
        this.searchHistory.forEach(item => {
            const card = this.createHistoryCard(item);
            historyContainer.appendChild(card);
        });
    }

    /**
     * Create history card element
     */
    createHistoryCard(item) {
        const card = document.createElement('div');
        card.className = `ban-status-card ${item.isBanned ? 'banned' : 'clean'}`;
        
        const date = new Date(item.timestamp);
        const timeStr = date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        card.innerHTML = `
            <div class="ban-status-header">
                <span class="ban-status-steamid">${item.steamId}</span>
                <span class="ban-status-badge ${item.isBanned ? 'banned' : 'clean'}">
                    ${item.isBanned ? '🚫 Забанен' : '✅ Чист'}
                </span>
            </div>
            <div class="ban-status-details">
                <div class="ban-detail-row">
                    <span class="ban-detail-label">Проверено:</span>
                    <span class="ban-detail-value">${timeStr}</span>
                </div>
                <div class="ban-detail-row">
                    <span class="ban-detail-label">Fear:</span>
                    <span class="ban-detail-value ${item.fearBanned ? 'banned' : 'clean'}">
                        ${item.fearBanned ? '❌ Забанен' : '✅ Чист'}
                    </span>
                </div>
            </div>
        `;
        
        return card;
    }
}

// Initialize check page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const checkPage = new CheckPage();
});
