/**
 * AntiCheatPage class for displaying online players
 */
class AntiCheatPage {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.playersList = null;
        this.players = [];
        this.refreshInterval = null;
        
        this.init();
    }

    /**
     * Initialize anti-cheat page
     */
    init() {
        this.playersList = document.getElementById('anticheat-players-list');
        
        if (!this.playersList) {
            console.error('[AntiCheatPage] Players list element not found');
            return;
        }
        
        // Load players immediately
        this.loadPlayers();
        
        // Auto-refresh every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.loadPlayers();
        }, 30000);
        
        console.info('[AntiCheatPage] Initialized');
    }

    /**
     * Load players from servers
     */
    async loadPlayers() {
        try {
            console.info('[AntiCheatPage] Loading players...');
            
            // Show loading state
            this.showLoading();
            
            // Fetch servers
            const servers = await this.apiClient.fetchServers();
            
            if (!servers || servers.length === 0) {
                this.showError('Нет доступных серверов');
                return;
            }
            
            // Extract all Steam IDs from all servers
            const allPlayers = [];
            
            servers.forEach(server => {
                if (server.players && Array.isArray(server.players)) {
                    server.players.forEach(player => {
                        allPlayers.push({
                            steamId: player.steamid,
                            serverName: server.name,
                            serverIp: server.ip,
                            kills: player.kills || 0,
                            deaths: player.deaths || 0,
                            ping: player.ping || 0
                        });
                    });
                }
            });
            
            if (allPlayers.length === 0) {
                this.showEmpty('Нет игроков онлайн');
                return;
            }
            
            console.info(`[AntiCheatPage] Found ${allPlayers.length} players online`);
            
            // Fetch player summaries (avatars, nicknames)
            const steamIds = allPlayers.map(p => p.steamId);
            const playerSummaries = await this.apiClient.fetchPlayerSummaries(steamIds);
            
            // Merge data
            const enrichedPlayers = allPlayers.map(player => {
                const summary = playerSummaries.find(s => s.steamid === player.steamId);
                
                return {
                    ...player,
                    nickname: summary?.personaname || 'Unknown',
                    avatar: summary?.avatarfull || summary?.avatarmedium || summary?.avatar || null,
                    accountCreated: summary?.timecreated || null
                };
            });
            
            this.players = enrichedPlayers;
            this.renderPlayers();
            
        } catch (error) {
            console.error('[AntiCheatPage] Error loading players:', error);
            this.showError('Ошибка загрузки данных');
        }
    }

    /**
     * Render players list
     */
    renderPlayers() {
        this.playersList.innerHTML = '';
        
        this.players.forEach(player => {
            const card = this.createPlayerCard(player);
            this.playersList.appendChild(card);
        });
    }

    /**
     * Create player card with new design
     */
    createPlayerCard(player) {
        const card = document.createElement('div');
        card.className = 'player-card';
        
        // Calculate account age
        const accountAge = this.calculateAccountAge(player.accountCreated);
        const isNewAccount = accountAge.isNew;
        
        // Avatar
        const avatarHtml = player.avatar 
            ? `<img src="${player.avatar}" alt="Avatar" class="player-avatar-large">`
            : `<div class="player-avatar-large" style="background: #333; display: flex; align-items: center; justify-content: center; font-size: 32px;">👤</div>`;
        
        card.innerHTML = `
            <div class="player-header">
                ${avatarHtml}
                <div class="player-info-header">
                    <div class="player-name">${this.escapeHtml(player.nickname)}</div>
                    <div class="player-steamid">${player.steamId}</div>
                </div>
            </div>
            
            <div class="account-age-badge">
                <div class="age-indicator ${isNewAccount ? 'new' : 'old'}"></div>
                <div>
                    <div class="age-text">${accountAge.text}</div>
                    <div class="age-date">${accountAge.date}</div>
                </div>
            </div>
            
            <div class="server-info">
                <div class="server-label">Сервер:</div>
                <div class="server-name">
                    ${this.escapeHtml(player.serverName)}
                    <span class="ip-badge">
                        📋 IP
                    </span>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-label">Убийства</div>
                    <div class="stat-value kills">${player.kills}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Смерти</div>
                    <div class="stat-value deaths">${player.deaths}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Пинг</div>
                    <div class="stat-value ping">${player.ping}ms</div>
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="action-btn-large" onclick="window.open('https://steamcommunity.com/profiles/${player.steamId}', '_blank')">
                    STEAM
                </button>
                <button class="action-btn-large" onclick="window.open('https://fearproject.ru/profile/${player.steamId}', '_blank')">
                    FEAR
                </button>
            </div>
            
            <div class="copy-buttons">
                <button class="copy-btn" onclick="window.copyToClipboard('${player.steamId}', this)">
                    📋 STEAMID
                </button>
                <button class="copy-btn" onclick="window.copyToClipboard('${player.serverIp}', this)">
                    📋 IP
                </button>
            </div>
            
            <button class="connect-btn" onclick="window.location.href='steam://connect/${player.serverIp}'">
                ▶ ПОДКЛЮЧИТЬСЯ
            </button>
        `;
        
        return card;
    }

    /**
     * Calculate account age
     */
    calculateAccountAge(timestamp) {
        if (!timestamp) {
            return {
                text: 'Неизвестно',
                date: 'Дата создания неизвестна',
                isNew: false
            };
        }
        
        const now = Date.now() / 1000;
        const ageSeconds = now - timestamp;
        const ageDays = Math.floor(ageSeconds / 86400);
        
        // Account is "new" if less than 30 days old
        const isNew = ageDays < 30;
        
        // Format time ago
        let timeText;
        if (ageDays < 1) {
            const hours = Math.floor(ageSeconds / 3600);
            timeText = `${hours} ${this.pluralize(hours, 'час', 'часа', 'часов')} назад`;
        } else if (ageDays < 30) {
            timeText = `${ageDays} ${this.pluralize(ageDays, 'день', 'дня', 'дней')} назад`;
        } else if (ageDays < 365) {
            const months = Math.floor(ageDays / 30);
            timeText = `${months} ${this.pluralize(months, 'месяц', 'месяца', 'месяцев')} назад`;
        } else {
            const years = Math.floor(ageDays / 365);
            timeText = `${years} ${this.pluralize(years, 'год', 'года', 'лет')} назад`;
        }
        
        // Format date
        const date = new Date(timestamp * 1000);
        const dateText = `Создан: ${date.toLocaleDateString('ru-RU')}`;
        
        return {
            text: isNew ? 'Очень новый' : timeText,
            date: dateText,
            isNew: isNew
        };
    }

    /**
     * Pluralize Russian words
     */
    pluralize(number, one, two, five) {
        let n = Math.abs(number);
        n %= 100;
        if (n >= 5 && n <= 20) {
            return five;
        }
        n %= 10;
        if (n === 1) {
            return one;
        }
        if (n >= 2 && n <= 4) {
            return two;
        }
        return five;
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.playersList.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="width: 60px; height: 60px; margin: 0 auto 20px; border: 4px solid rgba(102, 126, 234, 0.3); border-radius: 50%; border-top-color: #667eea; animation: spin 1s linear infinite;"></div>
                <p style="color: rgba(255, 255, 255, 0.7); font-size: 18px;">Загрузка игроков...</p>
            </div>
        `;
    }

    /**
     * Show error message
     */
    showError(message) {
        this.playersList.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
                <p style="color: white; font-size: 24px; margin-bottom: 10px;">Ошибка</p>
                <p style="color: rgba(255, 255, 255, 0.7); font-size: 18px;">${message}</p>
            </div>
        `;
    }

    /**
     * Show empty state
     */
    showEmpty(message) {
        this.playersList.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 64px; margin-bottom: 20px;">😴</div>
                <p style="color: white; font-size: 24px; margin-bottom: 10px;">Пусто</p>
                <p style="color: rgba(255, 255, 255, 0.7); font-size: 18px;">${message}</p>
            </div>
        `;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
}
