/**
 * FarewellModal - One-time modal with farewell message
 * Shows once using localStorage flag
 */
class FarewellModal {
    constructor() {
        this.storageKey = 'fear_farewell_modal_shown';
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
     * Show farewell modal
     */
    show() {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.id = 'farewell-modal';
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
            border: 2px solid rgba(185, 28, 28, 0.5);
            border-radius: 24px;
            padding: 48px;
            max-width: 700px;
            width: 90%;
            box-shadow: 0 25px 80px rgba(185, 28, 28, 0.4), 0 0 100px rgba(185, 28, 28, 0.2);
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
                #farewell-modal .emoji {
                    font-size: 80px;
                    margin-bottom: 24px;
                    display: block;
                    animation: pulse 2s ease-in-out infinite;
                }
                #farewell-modal .title {
                    font-size: 32px;
                    font-weight: 800;
                    background: linear-gradient(135deg, #dc2626 0%, #f87171 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 24px;
                    line-height: 1.2;
                }
                #farewell-modal .message {
                    font-size: 18px;
                    line-height: 1.8;
                    color: rgba(255, 255, 255, 0.9);
                    margin-bottom: 32px;
                    background: rgba(185, 28, 28, 0.1);
                    padding: 24px;
                    border-radius: 16px;
                    border: 1px solid rgba(185, 28, 28, 0.3);
                    text-align: left;
                }
                #farewell-modal .close-btn {
                    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                    color: white;
                    border: none;
                    padding: 18px 48px;
                    border-radius: 12px;
                    font-size: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4);
                    width: 100%;
                }
                #farewell-modal .close-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 30px rgba(220, 38, 38, 0.6);
                }
                #farewell-modal .signature {
                    margin-top: 24px;
                    font-size: 16px;
                    color: rgba(255, 255, 255, 0.6);
                    font-style: italic;
                }
            </style>
            
            <span class="emoji">👋</span>
            <h2 class="title">Прощальное сообщение</h2>
            <div class="message">
                <p style="margin: 0 0 16px 0;">
                    <strong>Доброго времени суток!</strong>
                </p>
                <p style="margin: 0 0 16px 0;">
                    Спешим сообщить вам что проект <strong>Fear Protection</strong> официально заморожен и новые обновления больше выходить не будут.
                </p>
                <p style="margin: 0 0 16px 0;">
                    <strong>Причина:</strong> выгорание создателя от проекта Fear и полный уход с проекта.
                </p>
                <p style="margin: 0 0 16px 0;">
                    Надеемся что вам нравится наш сайт и наше расширение и вы ими активно пользуетесь.
                </p>
                <p style="margin: 0;">
                    Ну а на этом мы заканчиваем, <strong>удачных вам банов</strong> и желаем чтоб вам не попадались дебилы на проверках! 🎮
                </p>
            </div>
            <button class="close-btn" onclick="document.getElementById('farewell-modal').dispatchEvent(new Event('close'))">
                Прощай
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
        new FarewellModal();
    });
} else {
    new FarewellModal();
}
