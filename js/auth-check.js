// Проверка авторизации
(function() {
    'use strict';
    
    // Проверяем наличие доступа
    const hasAccess = sessionStorage.getItem('fearAccess') === 'granted';
    
    if (!hasAccess) {
        // Сохраняем текущий URL для возврата после входа
        const currentPage = window.location.pathname.split('/').pop();
        window.location.href = `login.html?return=${currentPage}`;
    }
    
    // Проверяем токен каждые 5 минут (защита от обхода)
    setInterval(() => {
        if (sessionStorage.getItem('fearAccess') !== 'granted') {
            window.location.href = 'login.html';
        }
    }, 300000);
    
    // Добавляем кнопку выхода
    window.addEventListener('DOMContentLoaded', () => {
        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = '🚪 Выход';
        logoutBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: rgba(239, 68, 68, 0.9);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            z-index: 10000;
            transition: all 0.3s;
        `;
        
        logoutBtn.addEventListener('mouseenter', () => {
            logoutBtn.style.background = 'rgba(220, 38, 38, 1)';
            logoutBtn.style.transform = 'scale(1.05)';
        });
        
        logoutBtn.addEventListener('mouseleave', () => {
            logoutBtn.style.background = 'rgba(239, 68, 68, 0.9)';
            logoutBtn.style.transform = 'scale(1)';
        });
        
        logoutBtn.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите выйти?')) {
                sessionStorage.removeItem('fearAccess');
                localStorage.removeItem('fearAccessToken');
                window.location.href = 'login.html';
            }
        });
        
        document.body.appendChild(logoutBtn);
    });
})();
