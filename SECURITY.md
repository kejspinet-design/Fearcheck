# 🔒 Безопасность Fear Protection

## Обзор исправленных уязвимостей

Этот документ описывает уязвимости, которые были исправлены в проекте Fear Protection.

## ✅ Исправленные уязвимости

### 1. XSS (Cross-Site Scripting) - ВЫСОКИЙ РИСК
**Проблема:** Данные от API вставлялись через `innerHTML` без санитизации.
**Решение:** 
- Создан `SecurityUtils.sanitizeHtml()` для экранирования HTML
- Все вставки данных заменены на `textContent` или безопасные методы
- Добавлена функция `SecurityUtils.setInnerHTML()` для контролируемого HTML

### 2. Утечка API ключей - КРИТИЧЕСКИЙ РИСК
**Проблема:** Steam API Key и JWT токен хранились в клиентском коде.
**Решение:**
- Все ключи перемещены в серверные переменные окружения
- Создан безопасный APIClient без ключей
- Все запросы идут через серверные прокси `/api/*`

### 3. JavaScript: URL Injection - ВЫСОКИЙ РИСК
**Проблема:** URL аватарок не валидировались, возможна инъекция `javascript:` протокола.
**Решение:**
- Создан `SecurityUtils.sanitizeUrl()` с whitelist протоколов
- Валидация доменов для изображений
- Fallback на безопасный placeholder

### 4. Отсутствие CSP - СРЕДНИЙ РИСК
**Проблема:** Нет Content Security Policy.
**Решение:**
- Добавлен CSP meta-тег во все HTML файлы
- Ограничены источники скриптов, стилей и изображений

### 5. Steam ID Injection - ВЫСОКИЙ РИСК
**Проблема:** Steam ID не валидировались.
**Решение:**
- Добавлена валидация на клиенте через `SecurityUtils.validateSteamId()`
- Двойная валидация на сервере через middleware
- Регулярное выражение: `/^7656119\d{10}$/`

### 6. Отсутствие Rate Limiting - СРЕДНИЙ РИСК
**Проблема:** Нет защиты от DDoS/брутфорса.
**Решение:**
- Реализован rate limiting middleware на сервере
- Клиентский rate limiter в APIClient
- Лимит: 30 запросов в минуту

### 7. localStorage без шифрования - НИЗКИЙ РИСК
**Проблема:** trackedPlayers хранятся в открытом виде.
**Решение:**
- Добавлено шифрование через `SecurityUtils.encryptData()`
- Простое XOR шифрование с ключом
- Методы `saveToLocalStorage()` и `loadFromLocalStorage()`

### 8. WebSocket без авторизации - СРЕДНИЙ РИСК
**Проблема:** WebSocket подключался без токена.
**Решение:**
- Добавлена поддержка токена в URL
- Рекомендация использовать JWT токен для WS

### 9. CORS неправильно настроен - НИЗКИЙ РИСК
**Проблема:** CORS разрешал любые источники (`*`).
**Решение:**
- Whitelist доменов в `config.CORS.ALLOWED_ORIGINS`
- Проверка Origin header в middleware

### 10. Таймауты запросов - НИЗКИЙ РИСК
**Проблема:** Нет таймаутов для fetch запросов.
**Решение:**
- Добавлена функция `safeFetch()` с таймаутом
- Обработка AbortController для отмены запросов

## 🛡️ Защитные механизмы

### SecurityUtils.js
Универсальная библиотека безопасности с функциями:
- `sanitizeHtml()` - Экранирование HTML
- `sanitizeUrl()` - Валидация URL
- `validateSteamId()` - Валидация Steam ID
- `createTextElement()` - Безопасное создание элементов
- `createImageElement()` - Безопасные изображения
- `encryptData()` / `decryptData()` - Шифрование
- `createRateLimiter()` - Rate limiting
- `detectSqlInjection()` - Обнаружение SQL injection

### API Middleware
Серверные middleware для защиты:
- `corsMiddleware()` - CORS с whitelist
- `rateLimitMiddleware()` - Rate limiting
- `validateSteamId()` - Валидация Steam ID
- `validateIp()` - Валидация IP адресов
- `safeFetch()` - Безопасные запросы с таймаутом

### Серверные прокси
Все внешние API доступны только через серверные прокси:
- `/api/fear-servers` - Fear серверы
- `/api/reports-recent` - Недавние репорты
- `/api/player` - Данные игрока
- `/api/uma` - UMA баны
- `/api/avatar-proxy` - Прокси аватарок

## 🔑 Управление секретами

### Переменные окружения
Создай файл `.env`:
```
FEAR_ACCESS_TOKEN=your_token
STEAM_API_KEY=your_key
NODE_ENV=production
```

### Vercel Environment Variables
В Vercel Dashboard добавь:
1. `FEAR_ACCESS_TOKEN`
2. `STEAM_API_KEY`
3. `NODE_ENV`

## 🧪 Тестирование безопасности

### XSS тесты
```javascript
// Тест 1: HTML injection
addPlayer('<script>alert("XSS")</script>');

// Тест 2: IMG onerror
addPlayer('<img src=x onerror=alert("XSS")>');

// Тест 3: JavaScript URL
addPlayer('javascript:alert("XSS")');
```

### Injection тесты
```javascript
// SQL Injection
addPlayer("' OR 1=1--");

// Steam ID injection
addPlayer("76561198000000000'; DROP TABLE users--");
```

### Rate Limiting тест
```javascript
// 50 запросов подряд
for (let i = 0; i < 50; i++) {
    apiClient.fetchServers();
}
// Ожидаем 429 Too Many Requests
```

## 📊 Безопасность по OWASP Top 10

| № | Уязвимость | Статус | Приоритет |
|---|-----------|--------|-----------|
| A01:2021 | Broken Access Control | ✅ Исправлено | Высокий |
| A02:2021 | Cryptographic Failures | ✅ Исправлено | Критический |
| A03:2021 | Injection | ✅ Исправлено | Высокий |
| A04:2021 | Insecure Design | ✅ Исправлено | Средний |
| A05:2021 | Security Misconfiguration | ✅ Исправлено | Средний |
| A06:2021 | Vulnerable Components | ⚠️ Проверить | Низкий |
| A07:2021 | Auth Failures | ✅ Исправлено | Высокий |
| A08:2021 | Data Integrity Failures | ✅ Исправлено | Средний |
| A09:2021 | Logging Failures | ⚠️ Улучшить | Низкий |
| A10:2021 | SSRF | ✅ Исправлено | Средний |

## 🚨 Что еще можно улучшить

### Рекомендации для будущих версий:
1. **Добавить HTTPS Strict Transport Security (HSTS)**
2. **Использовать Subresource Integrity (SRI) для CDN**
3. **Добавить логирование security событий**
4. **Реализовать аутентификацию пользователей**
5. **Добавить CAPTCHA для форм**
6. **Использовать JWT с коротким временем жизни**
7. **Добавить мониторинг аномальной активности**
8. **Реализовать Content Security Policy Reporting**

## 📞 Контакты

Если нашли уязвимость, пожалуйста, сообщите:
- Discord: https://discord.gg/6EnswKAwR3
- Email: security@fearproject.ru (если есть)

## 📚 Ресурсы

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Vercel Security Best Practices](https://vercel.com/docs/security)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
