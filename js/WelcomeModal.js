/**
 * WelcomeModal - One-time modal with welcome message
 * Shows once using localStorage flag
 */
class WelcomeModal {
    constructor() {
        this.storageKey = 'fear_welcome_modal_shown';
        this.init();
    }

    /**
     * Initialize and show modal if not shown before
     */
    init() {
        // Check if modal was already shown
        const wasShown = localStorage.getItem(this.storageKey);
        
        if (!wasShown) {
            // Show modal after a short delay for better UX
            setTimeout(() => {
                this.show();
            }, 1000);
        }
    }

    /**
     * Show welcome modal
     */
    show() {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.id = 'welcome-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            animation: fadeIn 0.4s ease-out;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
        `;
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: linear-gradient(135deg, #1a1d29 0%, #252836 100%);
            border: 2px solid rgba(102, 126, 234, 0.5);
            border-radius: 24px;
            padding: 48px;
            max-width: 700px;
            width: 90%;
            box-shadow: 0 25px 80px rgba(102, 126, 234, 0.4), 0 0 100px rgba(102, 126, 234, 0.2);
            animation: slideIn 0.5s ease-out;
            position: relative;
            text-align: center;
        `;
        
        modalContent.innerHTML = `
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideIn {
                    from { 
                        transform: translateY(-50px) scale(0.9);
                        opacity: 0;
                    }
                    to { 
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                #welcome-modal .emoji {
                    font-size: 80px;
                    margin-bottom: 24px;
                    display: block;
                    animation: pulse 2s ease-in-out infinite;
                }
                #welcome-modal .title {
                    font-size: 36px;
                    font-weight: 900;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 24px;
                    line-height: 1.2;
                    letter-spacing: -1px;
                }
                #welcome-modal .message {
                    font-size: 18px;
                    line-height: 1.8;
                    color: rgba(255, 255, 255, 0.9);
                    margin-bottom: 32px;
                    background: rgba(102, 126, 234, 0.1);
                    padding: 24px;
                    border-radius: 16px;
                    border: 1px solid rgba(102, 126, 234, 0.3);
                    text-align: left;
                }
                #welcome-modal .close-btn {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 18px 48px;
                    border-radius: 12px;
                    font-size: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
                    width: 100%;
                }
                #welcome-modal .close-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 30px rgba(102, 126, 234, 0.6);
                }
                #welcome-modal .signature {
                    margin-top: 24px;
                    font-size: 16px;
                    color: rgba(255, 255, 255, 0.6);
                    font-style: italic;
                }
            </style>
            
            <span class="emoji">🎉</span>
            <h2 class="title">FEAR Protection возвращается!</h2>
            <div class="message">
                <p style="margin: 0 0 16px 0;">
                    <strong>Добро пожаловать!</strong>
                </p>
                <p style="margin: 0 0 16px 0;">
                    Мы рады сообщить, что проект <strong>Fear Protection</strong> снова в деле! 🚀
                </p>
                <p style="margin: 0;">
                    Присоединяйтесь к нашему Discord-сообществу, чтобы быть в курсе всех обновлений! 💬
                </p>
            </div>
            
            <button class="close-btn" onclick="document.getElementById('welcome-modal').dispatchEvent(new Event('close'))">
                Понятно!
            </button>
            <div class="signature">
                — Команда Fear Protection
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Handle close event
        modal.addEventListener('close', () => {
            this.close(modal);
        });
        
        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.close(modal);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close modal and mark as shown
     */
    close(modal) {
        // Mark as shown in localStorage
        localStorage.setItem(this.storageKey, 'true');
        
        // Fade out animation
        modal.style.animation = 'fadeOut 0.3s ease-out';
        
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new WelcomeModal();
    });
} else {
    new WelcomeModal();
}
