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
            alert('Ошибка при обработке файла');
            this.showUploadArea();
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
     * Check bans for Steam IDs using Fear API and UMA.SU API (OPTIMIZED v3 - PARALLEL)
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
        
        // Process Fear API and UMA.SU in PARALLEL
        console.time('[ConfigChecker] Total API time');
        const [fearResults, umaResults] = await Promise.all([
            this.checkFearBansBatch(uniqueSteamIds, (progress) => {
                this.showProgress(progress, uniqueSteamIds.length, 'Fear API');
            }),
            this.checkUmaBansBatch(uniqueSteamIds, 1, (progress) => {
                this.showProgress(progress, uniqueSteamIds.length, 'UMA.SU');
            })
        ]);
        console.timeEnd('[ConfigChecker] Total API time');
        
        // Calculate total time
        const endTime = performance.now();
        const totalTime = ((endTime - startTime) / 1000).toFixed(3); // seconds with milliseconds
        
        console.info(`[ConfigChecker] Total check time: ${totalTime}s`);
        
        // Combine results
        for (const steamId of uniqueSteamIds) {
            const fearResult = fearResults[steamId] || { banned: false, reason: 'Ошибка проверки' };
            const umaResult = umaResults[steamId] || { banned: false, reason: 'Ошибка проверки' };
            
            const result = {
                steamId: steamId,
                fearBanned: fearResult.banned,
                fearReason: fearResult.reason,
                umaBanned: umaResult.banned,
                umaReason: umaResult.reason,
                isBanned: fearResult.banned || umaResult.banned
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
     * Check UMA bans sequentially (STABLE - avoids WebSocket connection issues)
     */
    async checkUmaBansBatch(steamIds, batchSize = 1, progressCallback) {
        const results = {};
        
        console.info(`[ConfigChecker] Checking UMA.SU sequentially (${steamIds.length} IDs)`);
        
        let processed = 0;
        
        // Process sequentially to avoid WebSocket connection issues
        for (const steamId of steamIds) {
            const result = await this.checkUmaBanOptimized(steamId);
            results[steamId] = result;
            
            processed++;
            if (progressCallback) progressCallback(processed);
            
            // Small delay between requests to avoid overwhelming the server
            if (processed < steamIds.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        return results;
    }

    /**
     * Optimized UMA.SU check via server proxy (STABLE)
     */
    async checkUmaBanOptimized(steamId) {
        try {
            const response = await fetch(`/api/uma/check/${encodeURIComponent(steamId)}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                console.warn(`[ConfigChecker] UMA proxy returned ${response.status} for ${steamId}`);
                return { banned: false, reason: 'Ошибка API' };
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('[ConfigChecker] UMA proxy error:', error);
            return { banned: false, reason: 'Ошибка проверки' };
        }
    }

    /**
     * Check Fear ban status
     */
    async checkFearBan(steamId) {
        try {
            // Use proxy endpoint with correct path
            const response = await fetch(`/api/fear/punishments/search?q=${encodeURIComponent(steamId)}&page=1&limit=10&type=1`, {
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
     * Check UMA.SU ban status via WebSocket (LEGACY - used for single checks)
     */
    async checkUmaBan(steamId) {
        return this.checkUmaBanOptimized(steamId);
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
                <div class="ban-detail-row">
                    <span class="ban-detail-label">UMA.SU:</span>
                    <span class="ban-detail-value ${result.umaBanned ? 'banned' : 'clean'}">
                        ${result.umaBanned ? '❌ ' + result.umaReason : '✅ Не забанен'}
                    </span>
                </div>
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
