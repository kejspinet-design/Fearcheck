/**
 * Easter Egg - Click on logo icon to play music
 * DevTools blocking DISABLED for development
 */

// DevTools blocking is DISABLED
console.log('%c✅ Консоль разблокирована для разработки', 'color: #10B981; font-size: 18px; font-weight: bold;');

// Easter Egg - Music player
(function() {
    'use strict';
    
    let clickCount = 0;
    
    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        // Find logo icon
        const logoIcon = document.querySelector('.logo-container img');
        
        if (!logoIcon) {
            console.warn('[Easter Egg] Logo icon not found');
            return;
        }
        
        // Add click event
        logoIcon.style.cursor = 'pointer';
        logoIcon.style.transition = 'all 0.3s ease';
        
        logoIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            clickCount++;
            
            // Easter egg animation
            logoIcon.style.transform = 'rotate(360deg) scale(1.2)';
            setTimeout(() => {
                logoIcon.style.transform = 'rotate(0deg) scale(1)';
            }, 300);
            
            // Toggle music
            toggleMusic();
        });
        
        // Add hover effect
        logoIcon.addEventListener('mouseenter', function() {
            logoIcon.style.transform = 'scale(1.1)';
        });
        
        logoIcon.addEventListener('mouseleave', function() {
            logoIcon.style.transform = 'scale(1) rotate(0deg)';
        });
    });
    
    function toggleMusic() {
        // Create new audio element each time for sound effect
        const soundEffect = new Audio('./assets/sounds/1498374867383353515 (1).ogg');
        soundEffect.volume = 0.7;
        
        // Play sound effect
        soundEffect.play().then(() => {
            console.log('[Easter Egg] Sound played');
        }).catch(error => {
            console.error('[Easter Egg] Failed to play sound:', error);
        });
    }
    
    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
                filter: drop-shadow(0 0 5px rgba(220, 38, 38, 0.5));
            }
            50% {
                transform: scale(1.05);
                filter: drop-shadow(0 0 15px rgba(220, 38, 38, 0.8));
            }
        }
    `;
    document.head.appendChild(style);
})();
