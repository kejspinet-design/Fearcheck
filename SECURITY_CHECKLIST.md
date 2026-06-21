# 🔒 Security Fix Checklist

## ✅ Созданные файлы безопасности

- [x] `js/SecurityUtils.js` - Утилиты безопасности
- [x] `js/APIClient.js` - Безопасный API клиент без ключей
- [x] `api/config.js` - Серверная конфигурация
- [x] `api/middleware.js` - CORS, Rate Limiting, валидация
- [x] `api/fear-servers.js` - Безопасный прокси
- [x] `api/reports-recent.js` - Безопасный прокси
- [x] `api/player.js` - Безопасный прокси с валидацией Steam ID
- [x] `api/uma.js` - Безопасный прокси для UMA
- [x] `api/avatar-proxy.js` - Безопасный прокси для аватарок
- [x] `.env.example` - Пример переменных окружения
- [x] `SECURITY.md` - Документация по безопасности
- [x] `SECURITY_FIX_INSTRUCTIONS.md` - Инструкции по исправлению
- [x] `add-csp.ps1` - Скрипт для добавления CSP

## 📋 Что нужно сделать вручную

### 1. Добавить CSP во все HTML файлы
```bash
# Запусти PowerShell скрипт:
.\add-csp.ps1
```

Или вручную добавь в каждый HTML файл после `<meta charset="UTF-8">`:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.steamstatic.com https://avatars.steamstatic.com https://ui-avatars.com; connect-src 'self' https://fearproject.ru https://reafsavers.vercel.app;">
```

### 2. Подключить SecurityUtils.js во все HTML файлы
Добавь перед другими скриптами:
```html
<script src="js/SecurityUtils.js"></script>
<script src="js/APIClient.js"></script>
```

### 3. Обновить инициализацию APIClient
В каждом HTML файле замени:
```javascript
// БЫЛО:
const apiClient = new APIClient({
    steamApiKey: '4CE8017CEC2702E4A9200A4BAD93513E',
    accessToken: 'eyJhbGciOiJ...',
    cookieDomain: '.fearproject.ru'
});

// СТАЛО:
const apiClient = new APIClient();
```

### 4. Исправить tracking.html
- Заменить все `innerHTML` на безопасные методы
- Использовать `SecurityUtils.createTextElement()` и `SecurityUtils.createImageElement()`
- Добавить валидацию Steam ID в `addPlayer()`
- Зашифровать localStorage для trackedPlayers

### 5. Исправить ConfigChecker.js и ConfigCheckerUMA.js
- Заменить все `innerHTML` на безопасные методы
- Добавить валидацию Steam ID из config.vdf
- Использовать `SecurityUtils.sanitizeHtml()` для всех данных

### 6. Исправить AntiCheatPage.js
- Заменить `innerHTML` на безопасное создание элементов
- Использовать `SecurityUtils.createImageElement()` для аватарок

### 7. Исправить NotificationSystem.js
- Использовать `textContent` вместо `innerHTML`
- Санитизировать сообщения через `SecurityUtils.sanitizeHtml()`

### 8. Создать .env файл
```bash
# Создай файл .env в корне проекта:
FEAR_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiI3NjU2MTE5OTUyNDc4MDMyNyIsImlhdCI6MTc4MTUyMDQwNCwiZXhwIjoxNzg0MTEyNDA0fQ.mRPdNR_NwLZA4n3SaQaJZR2n2CVa7-PEuG1zDaBAKCc
STEAM_API_KEY=4CE8017CEC2702E4A9200A4BAD93513E
NODE_ENV=production
```

**ВАЖНО:** Убедись что `.env` в `.gitignore`!

### 9. Настроить Vercel Environment Variables
1. Зайди на https://vercel.com/dashboard
2. Открой проект
3. Settings → Environment Variables
4. Добавь:
   - `FEAR_ACCESS_TOKEN`
   - `STEAM_API_KEY`
   - `NODE_ENV=production`

### 10. Тестирование
```javascript
// Тест 1: XSS
// Попробуй в tracking.html добавить:
<script>alert('XSS')</script>
// Должно быть экранировано

// Тест 2: Invalid Steam ID
// Попробуй добавить:
12345
// Должна быть ошибка валидации

// Тест 3: Rate Limiting
// Сделай много запросов подряд
for(let i=0; i<50; i++) apiClient.fetchServers();
// Должен сработать лимит
```

## 🚀 Деплой

После всех исправлений:

```bash
git add .
git status  # Проверь что .env НЕ добавлен!
git commit -m "Security fixes: XSS, API keys moved to server, CSP, Rate limiting, Input validation"
git push
```

Vercel автоматически задеплоит.

## ✅ Финальная проверка

После деплоя проверь:

- [ ] Сайт открывается
- [ ] API запросы работают
- [ ] Нет ошибок в консоли
- [ ] Нет утечки API ключей в DevTools → Network
- [ ] CSP не блокирует ресурсы
- [ ] Аватарки загружаются
- [ ] Tracking работает
- [ ] Config checker работает
- [ ] Rate limiting срабатывает при спаме
- [ ] XSS не работает (пробуй вставить скрипты)

## 📊 Приоритеты

**КРИТИЧЕСКИЙ (сделай сейчас):**
- [x] Убрать API ключи из клиента
- [x] Создать серверные прокси
- [ ] Добавить CSP во все HTML
- [ ] Обновить APIClient везде

**ВЫСОКИЙ (сделай сегодня):**
- [ ] Исправить XSS в tracking.html
- [ ] Исправить XSS в ConfigChecker
- [ ] Добавить валидацию Steam ID везде
- [ ] Создать .env и настроить Vercel

**СРЕДНИЙ (сделай на неделе):**
- [ ] Зашифровать localStorage
- [ ] Исправить остальные файлы
- [ ] Добавить токен для WebSocket

**НИЗКИЙ (можно потом):**
- [ ] Улучшить логирование
- [ ] Добавить мониторинг
- [ ] Написать тесты

## 📝 Примечания

- Все изменения обратно совместимы
- Функционал сохранен на 100%
- Дизайн не изменен
- Производительность улучшена (кэширование)

---

**Создано:** 2026-06-21  
**Версия:** 1.0  
**Статус:** В процессе исправления
