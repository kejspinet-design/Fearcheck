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
        
        this.init();
    }

    /**
     * Initialize check page
     */
    init() {
        console.info('[CheckPage] Initialized - Config.vdf checker only');
    }
}

// Initialize check page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const checkPage = new CheckPage();
});