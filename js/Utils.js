/**
 * Utils - вспомогательные утилиты
 */

/**
 * Debounce - задержка выполнения функции до прекращения вызовов
 * @param {Function} func - функция для вызова
 * @param {number} wait - время задержки в мс
 * @returns {Function} - обернутая функция
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle - ограничение частоты вызовов функции
 * @param {Function} func - функция для вызова
 * @param {number} limit - минимальный интервал между вызовами в мс
 * @returns {Function} - обернутая функция
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Форматирование даты
 * @param {string|Date} date - дата для форматирования
 * @returns {string} - отформатированная дата
 */
function formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
}

/**
 * Форматирование времени в удобочитаемый формат
 * @param {number} seconds - количество секунд
 * @returns {string} - отформатированное время
 */
function formatDuration(seconds) {
    if (!seconds || seconds < 0) return '0 сек';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const parts = [];
    if (days > 0) parts.push(`${days} д`);
    if (hours > 0) parts.push(`${hours} ч`);
    if (minutes > 0) parts.push(`${minutes} мин`);
    if (secs > 0 && days === 0) parts.push(`${secs} сек`);
    
    return parts.join(' ') || '0 сек';
}

/**
 * Вычисление возраста аккаунта
 * @param {string} createdDate - дата создания аккаунта
 * @returns {Object} - объект с информацией о возрасте
 */
function calculateAccountAge(createdDate) {
    if (!createdDate) {
        return { isNew: false, ageText: 'Неизвестно', ageDays: 0 };
    }

    const created = new Date(createdDate);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const isNew = diffDays < 365; // Новый аккаунт = меньше 1 года
    
    let ageText = '';
    if (diffDays < 30) {
        ageText = `${diffDays} дн`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        ageText = `${months} мес`;
    } else {
        const years = Math.floor(diffDays / 365);
        ageText = `${years} ${years === 1 ? 'год' : 'лет'}`;
    }

    return { isNew, ageText, ageDays: diffDays };
}

/**
 * Показать toast уведомление
 * @param {string} message - сообщение
 * @param {string} type - тип (success, error, warning, info)
 * @param {number} duration - длительность показа в мс
 */
function showToast(message, type = 'info', duration = 3000) {
    // Создаем контейнер для тостов если его нет
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    // Создаем toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        font-weight: 600;
        pointer-events: auto;
        cursor: pointer;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
        word-wrap: break-word;
    `;
    toast.textContent = message;

    // Добавляем анимацию появления
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    if (!document.getElementById('toast-styles')) {
        style.id = 'toast-styles';
        document.head.appendChild(style);
    }

    container.appendChild(toast);

    // Удаление по клику
    toast.onclick = () => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    };

    // Автоудаление
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Создать скелетон для загрузки
 * @param {number} count - количество скелетонов
 * @returns {string} - HTML скелетонов
 */
function createSkeleton(count = 1) {
    const skeletonHTML = `
        <div class="skeleton-card">
            <div class="skeleton-header">
                <div class="skeleton-avatar"></div>
                <div class="skeleton-info">
                    <div class="skeleton-line skeleton-line-title"></div>
                    <div class="skeleton-line skeleton-line-subtitle"></div>
                </div>
            </div>
            <div class="skeleton-body">
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line skeleton-line-short"></div>
            </div>
        </div>
    `;
    
    return Array(count).fill(skeletonHTML).join('');
}

/**
 * Плавная прокрутка к элементу
 * @param {HTMLElement|string} element - элемент или селектор
 * @param {number} offset - отступ сверху
 */
function scrollToElement(element, offset = 0) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return;
    
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
}

/**
 * Экспорт данных в CSV
 * @param {Array} data - массив объектов для экспорта
 * @param {string} filename - имя файла
 */
function exportToCSV(data, filename = 'export.csv') {
    if (!data || data.length === 0) {
        showToast('Нет данных для экспорта', 'warning');
        return;
    }

    // Получаем заголовки из первого объекта
    const headers = Object.keys(data[0]);
    
    // Формируем CSV
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const cell = row[header] || '';
                // Экранируем запятые и кавычки
                return `"${String(cell).replace(/"/g, '""')}"`;
            }).join(',')
        )
    ].join('\n');

    // Создаем и скачиваем файл
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    showToast('Файл успешно экспортирован', 'success');
}
