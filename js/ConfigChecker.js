/**
 * ConfigChecker class for parsing config.vdf and checking bans
 */
class ConfigChecker {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.uploadArea = null;
        this.fileInput = null;
        this.resultsColumn = null;
        this.countElement = null;
        
        this.init();
    }

    /**
     * Initialize config checker
     */
    init() {
        this.uploadArea = document.getElementById('configUploadArea');
        this.fileInput = document.getElementById('configFileInput');
        this.resultsColumn = document.getElementById('config-check-column');
        this.countElement = document.getElementById('configCheckCount');
        
        if (!this.uploadArea || !this.fileInput || !this.resultsColumn) {
            console.error('[ConfigChecker] Required elements not found');
            return;
        }
        
        // Bind events
        this.bindEvents();
        
        console.info('[ConfigChecker] Initialized');
    }

    /**
     * Bind drag-and-drop and file input events
     */
    bindEvents() {
        // File input change
        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFile(file);
            }
        });
        
        // Click to open file dialog
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });
        
        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.uploadArea.classList.add('drag-over');
        });
        
        this.uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.uploadArea.classList.remove('drag-over');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.uploadArea.classList.remove('drag-over');
            
            const file = e.dataTransfer.files[0];
            if (file) {
                this.handleFile(file);
            }
        });
    }

    /**
     * Handle uploaded file
     */
    async handleFile(file) {
        console.info('[ConfigChecker] File uploaded:', file.name);
        
        // Validate file
        if (!file.name.endsWith('.vdf') && !file.name.endsWith('.cfg')) {
            alert('Пожалуйста, загрузите файл config.vdf или config.cfg');
            return;
        }
        
        // Show processing state
        this.showProcessing();
        
        try {
            // Read file content
            const content = await this.readFile(file);
            
            // Parse Steam IDs from config
            const steamIds = this.parseSteamIds(content);
            
            console.info('[ConfigChecker] Found Steam IDs:', steamIds.length);
            
            if (steamIds.length === 0) {
                alert('В файле не найдено Steam ID');
                this.showUploadArea();
                return;
            }
            
            // Check bans for each Steam ID
            const results = await this.checkBans(steamIds);
            
            // Render results
            this.renderResults(results);
            
        } catch (error) {
            console.error('[ConfigChecker] Error processing file:', error);
            this.showError('Ошибка при обработке файла');
        }
    }

    /**
     * Read file content
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            
            reader.onerror = (e) => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }

    /**
     * Parse Steam IDs from config.vdf content
     * Looks for patterns like "7656119XXXXXXXXXX"
     */
    parseSteamIds(content) {
        const steamIdPattern = /7656119\d{10}/g;
        const matches = content.match(steamIdPattern);
        
        if (!matches) {
            return [];
        }
        
        // Remove duplicates
        return [...new Set(matches)];
    }

    /**
     * Check bans for Steam IDs using Fear API (OPTIMIZED v3 - PARALLEL)
     */
    async checkBans(steamIds) {
        const results = [];
        const cache = new Map(); // Cache for duplicate Steam IDs
        
        // Remove duplicates and use cache
        const uniqueSteamIds = [...new Set(steamIds)];
        
        console.info(`[ConfigChecker] Processing ${uniqueSteamIds.length} unique Steam IDs (${steamIds.length} total)`);
        
        // Show progress
        this.showProgress(0, uniqueSteamIds.length);
        
        // Start timer
        const startTime = performance.now();
        
        try {
            // Process Fear API only
            console.time('[ConfigChecker] Total API time');
            const fearResults = await this.checkFearBansBatch(uniqueSteamIds, (progress) => {
                this.showProgress(progress, uniqueSteamIds.length, 'Fear API');
            });
            console.timeEnd('[ConfigChecker] Total API time');
            
            // Calculate total time
            const endTime = performance.now();
            const totalTime = ((endTime - startTime) / 1000).toFixed(3); // seconds with milliseconds
            
            console.info(`[ConfigChecker] Total check time: ${totalTime}s`);
            
            // Combine results
            for (const steamId of uniqueSteamIds) {
                const fearResult = fearResults[steamId] || { banned: false, reason: 'Ошибка проверки' };
                
                const result = {
                    steamId: steamId,
                    fearBanned: fearResult.banned,
                    fearReason: fearResult.reason,
                    isBanned: fearResult.banned
                };
                
                cache.set(steamId, result);
            }
            
            // Map all Steam IDs (including duplicates) to results
            for (const steamId of steamIds) {
                results.push(cache.get(steamId));
            }
            
            // Store total time for display
            this.totalCheckTime = totalTime;
            
            return results;
            
        } catch (error) {
            console.error('[ConfigChecker] Critical error during check:', error);
            throw error; // Re-throw to be caught by handleFile
        }
    }

    /**
     * Show progress indicator
     */
    showProgress(current, total, stage = '') {
        const percent = Math.round((current / total) * 100);
        const stageText = stage ? ` (${stage})` : '';
        
        this.resultsColumn.innerHTML = `
            <div class="config-processing">
                <div class="processing-spinner"></div>
                <p class="processing-text">Проверяем игроков${stageText}...</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percent}%"></div>
                </div>
                <p class="processing-subtext">${current} / ${total} (${percent}%)</p>
            </div>
        `;
    }

    /**
     * Check Fear bans in batches (OPTIMIZED v2 - FASTER)
     */
    async checkFearBansBatch(steamIds, progressCallback) {
        const results = {};
        const BATCH_SIZE = 50; // Increased from 20 to 50 for faster processing
        
        // Process in parallel batches
        const batches = [];
        for (let i = 0; i < steamIds.length; i += BATCH_SIZE) {
            batches.push(steamIds.slice(i, i + BATCH_SIZE));
        }
        
        console.info(`[ConfigChecker] Checking Fear API in ${batches.length} batches of ${BATCH_SIZE}`);
        
        let processed = 0;
        
        // Process all batches in parallel
        const batchPromises = batches.map(async (batch) => {
            const batchResult = await this.processFearBatch(batch);
            processed += batch.length;
            if (progressCallback) progressCallback(processed);
            return batchResult;
        });
        
        const batchResults = await Promise.all(batchPromises);
        
        // Combine results
        batchResults.forEach(batchResult => {
            Object.assign(results, batchResult);
        });
        
        return results;
    }

    /**
     * Process single Fear API batch
     */
    async processFearBatch(steamIds) {
        const results = {};
        
        // Process each Steam ID in parallel within batch
        const promises = steamIds.map(async (steamId) => {
            try {
                const result = await this.checkFearBan(steamId);
                results[steamId] = result;
            } catch (error) {
                console.error(`[ConfigChecker] Error checking Fear for ${steamId}:`, error);
                results[steamId] = { banned: false, reason: 'Ошибка проверки' };
            }
        });
        
        await Promise.all(promises);
        return results;
    }

    /**
     * Check Fear ban status
     */
    async checkFearBan(steamId) {
        try {
            // Use server proxy
            const response = await fetch(`/api/fear?q=${encodeURIComponent(steamId)}&page=1&limit=10&type=1`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                console.warn(`[ConfigChecker] Fear API returned ${response.status} for ${steamId}`);
                return { banned: false, reason: 'Ошибка API' };
            }
            
            const data = await response.json();
            
            // Check if any bans found in punishments array
            if (data && data.punishments && Array.isArray(data.punishments) && data.punishments.length > 0) {
                // Found ban(s)
                const ban = data.punishments[0]; // Get first ban
                const reason = ban.reason || 'Забанен';
                const status = ban.status; // 1 = active, 0 = expired
                
                if (status === 1) {
                    return {
                        banned: true,
                        reason: reason
                    };
                } else {
                    return {
                        banned: false,
                        reason: 'Бан истек'
                    };
                }
            } else {
                // No bans found
                return { banned: false, reason: 'Не забанен' };
            }
        } catch (error) {
            console.warn('[ConfigChecker] Fear API check failed:', error);
            return { banned: false, reason: 'Ошибка проверки' };
        }
    }

    /**
     * Show processing state
     */
    showProcessing() {
        this.uploadArea.style.display = 'none';
        this.resultsColumn.style.display = 'flex';
        this.resultsColumn.innerHTML = `
            <div class="config-processing">
                <div class="processing-spinner"></div>
                <p class="processing-text">Обработка файла...</p>
                <p class="processing-subtext">Проверяем игроков на баны</p>
            </div>
        `;
    }

    /**
     * Show upload area
     */
    showUploadArea() {
        this.uploadArea.style.display = 'flex';
        this.resultsColumn.style.display = 'none';
        this.resultsColumn.innerHTML = '';
        this.updateCount(0);
    }

    /**
     * Show error message with Discord support link (MODAL)
     */
    showError(message) {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000; animation: fadeIn 0.3s;';
        
        // Create modal content
        modal.innerHTML = `
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideIn {
                    from { transform: translateY(-50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            </style>
            <div style="background: linear-gradient(135deg, #ff4757 0%, #ff6348 100%); color: white; padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.5); max-width: 600px; width: 90%; animation: slideIn 0.3s;">
                <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
                <h2 style="margin: 0 0 20px 0; font-size: 28px; font-weight: bold;">${message}</h2>
                <p style="margin: 20px 0; font-size: 18px; line-height: 1.8; background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px;">
                    Извините, у нас ошибка!<br>
                    Откройте консоль (<strong>F12</strong>), заскриньте ошибки<br>
                    и отправьте нашему разработчику в Discord сервер.
                </p>
                <a href="https://discord.gg/QcBKPYUFYS" target="_blank" style="display: inline-block; background: white; color: #ff4757; padding: 18px 50px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 20px; margin: 10px; transition: all 0.3s; box-shadow: 0 6px 15px rgba(0,0,0,0.3);" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 15px rgba(0,0,0,0.3)'">
                    🎮 Открыть Discord
                </a>
                <button onclick="this.closest('div[style*=fixed]').remove(); location.reload()" style="display: block; width: 100%; background: rgba(255,255,255,0.2); color: white; border: 2px solid white; padding: 15px; border-radius: 12px; font-size: 18px; font-weight: bold; margin-top: 20px; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    🔄 Перезагрузить страницу
                </button>
                <button onclick="this.closest('div[style*=fixed]').remove()" style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); color: white; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 24px; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='rotate(90deg)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='rotate(0deg)'">
                    ×
                </button>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(modal);
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    /**
     * Render check results
     */
    renderResults(results) {
        this.resultsColumn.innerHTML = '';
        this.resultsColumn.style.display = 'flex';
        this.uploadArea.style.display = 'none';
        
        // Count banned players
        const bannedCount = results.filter(r => r.isBanned).length;
        this.updateCount(bannedCount);
        
        // Sort: banned first
        results.sort((a, b) => {
            if (a.isBanned && !b.isBanned) return -1;
            if (!a.isBanned && b.isBanned) return 1;
            return 0;
        });
        
        // Render each result
        results.forEach(result => {
            const card = this.createResultCard(result);
            this.resultsColumn.appendChild(card);
        });
        
        // Add reset button
        const resetButton = document.createElement('button');
        resetButton.className = 'upload-button';
        resetButton.textContent = 'Проверить другой файл';
        resetButton.style.marginTop = '20px';
        resetButton.style.alignSelf = 'center';
        resetButton.onclick = () => this.showUploadArea();
        
        this.resultsColumn.appendChild(resetButton);
    }

    /**
     * Create result card element
     */
    createResultCard(result) {
        const card = document.createElement('div');
        card.className = `ban-status-card ${result.isBanned ? 'banned' : 'clean'}`;
        
        card.innerHTML = `
            <div class="ban-status-header">
                <span class="ban-status-steamid">${result.steamId}</span>
                <span class="ban-status-badge ${result.isBanned ? 'banned' : 'clean'}">
                    ${result.isBanned ? '🚫 Забанен' : '✅ Чист'}
                </span>
            </div>
            <div class="ban-status-details">
                <div class="ban-detail-row">
                    <span class="ban-detail-label">Fear:</span>
                    <span class="ban-detail-value ${result.fearBanned ? 'banned' : 'clean'}">
                        ${result.fearBanned ? '❌ ' + result.fearReason : '✅ Не забанен'}
                    </span>
                </div>
            </div>
            <div class="card-actions">
                <a href="https://fearproject.ru/profile/${result.steamId}" target="_blank" class="action-btn action-btn-profile">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Профиль Fear
                </a>
                <button class="action-btn action-btn-copy" onclick="window.copyToClipboard('${result.steamId}', this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Скопировать ID
                </button>
            </div>
        `;
        
        return card;
    }

    /**
     * Update count badge
     */
    updateCount(count) {
        if (this.countElement) {
            this.countElement.textContent = count;
        }
    }
}
