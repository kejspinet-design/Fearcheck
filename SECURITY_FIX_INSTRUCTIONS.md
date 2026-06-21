# 🔒 Инструкции по исправлению уязвимостей Fear Protection

## ✅ Что уже исправлено:

1. **SecurityUtils.js** - Универсальные функции безопасности
2. **APIClient.js** - Безопасный клиент API без ключей
3. **api/config.js** - Серверная конфигурация с секретами
4. **api/middleware.js** - CORS, Rate Limiting, валидация
5. **api/fear-servers.js** - Безопасный прокси для серверов
6. **api/reports-recent.js** - Безопасный прокси для репортов
7. **api/player.js** - Безопасный прокси для игроков
8. **api/uma.js** - Безопасный прокси для UMA API
9. **api/avatar-proxy.js** - Безопасный прокси для аватарок

## 📝 Что нужно исправить в каждом HTML файле:

### Общие изменения для ВСЕХ HTML файлов:

#### 1. Добавить CSP meta-тег в <head>:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.steamstatic.com https://avatars.steamstatic.com https://ui-avatars.com; connect-src 'self' https://fearproject.ru https://reafsavers.vercel.app;">
```

#### 2. Подключить SecurityUtils.js ПЕРЕД APIClient.js:
```html
<script src="js/SecurityUtils.js"></script>
<script src="js/APIClient.js"></script>
```

#### 3. Удалить ВСЕ прямые упоминания ключей:
Убрать:
```javascript
steamApiKey: '4CE8017CEC2702E4A9200A4BAD93513E'
accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

#### 4. Изменить инициализацию APIClient:
Было:
```javascript
const apiClient = new APIClient({
    steamApiKey: '4CE8017CEC2702E4A9200A4BAD93513E',
    accessToken: '...',
    cookieDomain: '.fearproject.ru'
});
```

Стало:
```javascript
const apiClient = new APIClient();
```

## 🔧 Исправления для tracking.html:

### Проблемы:
1. innerHTML без санитизации (строки 620-680)
2. Аватарки вставляются небезопасно
3. Нет валидации Steam ID

### Исправления:

1. Заменить создание карточки игрока:
```javascript
// БЫЛО (небезопасно):
card.innerHTML = `
    <div class="result-header">
        <img src="${avatarUrl}" alt="${playerData.name}">
        <div class="admin-name">${playerData.name}</div>
    </div>
`;

// СТАЛО (безопасно):
const header = document.createElement('div');
header.className = 'result-header';

const avatar = SecurityUtils.createImageElement(
    SecurityUtils.sanitizeUrl(avatarUrl),
    SecurityUtils.sanitizeHtml(playerData.name),
    'result-avatar'
);

const nameEl = SecurityUtils.createTextElement(
    'div',
    SecurityUtils.sanitizeHtml(playerData.name),
    'admin-name'
);

header.appendChild(avatar);
header.appendChild(nameEl);
card.appendChild(header);
```

2. Валидация Steam ID перед добавлением:
```javascript
function addPlayer() {
    const input = document.getElementById('searchInput').value.trim();
    if (!input) return;
    
    const steamId = extractSteamId(input);
    if (!steamId || !SecurityUtils.validateSteamId(steamId)) {
        alert('Неверный формат Steam ID');
        return;
    }
    
    // ... остальной код
}
```

## 🔧 Исправления для check.html:

### В ConfigChecker.js и ConfigCheckerUMA.js:

1. Санитизация всех данных из файла:
```javascript
// БЫЛО:
playerCard.innerHTML = `<div class="player-name">${player.name}</div>`;

// СТАЛО:
const nameEl = SecurityUtils.createTextElement(
    'div',
    SecurityUtils.sanitizeHtml(player.name),
    'player-name'
);
playerCard.appendChild(nameEl);
```

2. Валидация Steam ID из config.vdf:
```javascript
// После парсинга Steam ID:
if (!SecurityUtils.validateSteamId(steamId)) {
    console.warn('[ConfigChecker] Invalid Steam ID:', steamId);
    continue; // Пропускаем невалидный ID
}
```

3. WebSocket с токеном (ConfigCheckerUMA.js):
```javascript
// БЫЛО:
this.ws = new WebSocket('wss://fearproject.ru/ws');

// СТАЛО (если потребуется):
// Токен должен генерироваться на сервере и передаваться клиенту
this.ws = new WebSocket('wss://fearproject.ru/ws?token=' + await getAuthToken());
```

## 🔧 Исправления для anticheat.html:

### В AntiCheatPage.js:

1. Санитизация данных игроков:
```javascript
renderPlayers(players) {
    players.forEach(player => {
        const card = document.createElement('div');
        card.className = 'player-card';
        
        // Безопасное создание элементов
        const name = SecurityUtils.createTextElement('div', player.name, 'player-name');
        const steamId = SecurityUtils.createTextElement('div', player.steam_id, 'player-steamid');
        const avatar = SecurityUtils.createImageElement(
            SecurityUtils.sanitizeUrl(player.avatar),
            player.name,
            'player-avatar'
        );
        
        card.appendChild(avatar);
        card.appendChild(name);
        card.appendChild(steamId);
        
        container.appendChild(card);
    });
}
```

## 🔧 Исправления для NotificationSystem.js:

1. Санитизация уведомлений:
```javascript
show(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Безопасная вставка текста
    notification.textContent = SecurityUtils.sanitizeHtml(message);
    
    document.body.appendChild(notification);
}
```

## 📦 Создание .env файла для Vercel:

Создайте файл `.env` в корне проекта:
```
FEAR_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiI3NjU2MTE5OTUyNDc4MDMyNyIsImlhdCI6MTc4MTUyMDQwNCwiZXhwIjoxNzg0MTEyNDA0fQ.mRPdNR_NwLZA4n3SaQaJZR2n2CVa7-PEuG1zDaBAKCc
STEAM_API_KEY=4CE8017CEC2702E4A9200A4BAD93513E
NODE_ENV=production
```

**ВАЖНО:** Добавьте `.env` в `.gitignore`!

Затем добавьте эти переменные в Vercel Dashboard:
1. Зайди в проект на vercel.com
2. Settings → Environment Variables
3. Добавь каждую переменную

## 🔒 Шифрование trackedPlayers в localStorage:

В tracking.html:
```javascript
// Сохранение
SecurityUtils.saveToLocalStorage('trackedPlayers', trackedPlayers, true); // true = шифрование

// Загрузка
const trackedPlayers = SecurityUtils.loadFromLocalStorage('trackedPlayers', true) || [];
```

## ✅ Чеклист исправлений:

- [ ] Все HTML файлы имеют CSP meta-тег
- [ ] SecurityUtils.js подключен везде
- [ ] APIClient.js не содержит ключей
- [ ] Все innerHTML заменены на безопасные методы
- [ ] Все аватарки проходят через sanitizeUrl()
- [ ] Все Steam ID валидируются
- [ ] localStorage шифруется для trackedPlayers
- [ ] .env создан и добавлен в .gitignore
- [ ] Переменные окружения добавлены в Vercel
- [ ] Все серверные API используют middleware
- [ ] Rate limiting активен на всех эндпоинтах

## 🧪 Тестирование:

1. Проверь XSS:
```javascript
// Попробуй добавить в поиск:
<script>alert('XSS')</script>
// Должно быть экранировано
```

2. Проверь SQL injection:
```
' OR 1=1--
// Должна быть валидация
```

3. Проверь невалидный Steam ID:
```
12345678901234567890
// Должна быть ошибка
```

4. Проверь Rate Limiting:
```javascript
// Сделай 50 запросов подряд
for (let i = 0; i < 50; i++) {
    apiClient.fetchServers();
}
// Должна быть ошибка 429
```

## 📚 Дополнительные ресурсы:

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- CSP Guide: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- Vercel Security: https://vercel.com/docs/security

## 🚀 Деплой:

После всех исправлений:
```bash
git add .
git commit -m "Security fixes: XSS, API keys, CSP, Rate limiting"
git push
```

Vercel автоматически задеплоит изменения.
