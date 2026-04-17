# 🚀 Инструкция по деплою

## Деплой на Vercel (Рекомендуется)

### Способ 1: Через Vercel CLI

1. Установите Vercel CLI:
```bash
npm install -g vercel
```

2. Войдите в аккаунт:
```bash
vercel login
```

3. Деплой:
```bash
cd check-page-standalone
vercel
```

4. Следуйте инструкциям в терминале

### Способ 2: Через GitHub + Vercel Dashboard

1. Создайте репозиторий на GitHub
2. Загрузите папку `check-page-standalone` в репозиторий
3. Зайдите на https://vercel.com
4. Нажмите "New Project"
5. Импортируйте ваш GitHub репозиторий
6. **Установите Root Directory**: `check-page-standalone`
7. Нажмите "Deploy"

### Способ 3: Через Vercel Dashboard (Drag & Drop)

1. Зайдите на https://vercel.com
2. Нажмите "Add New..." → "Project"
3. Перетащите папку `check-page-standalone` в окно браузера
4. Vercel автоматически задеплоит сайт

---

## ✨ Новые возможности

### Serverless API для Fear Project

Теперь включена **serverless функция** для работы с Fear API:

- **Endpoint**: `/api/fear?q={steamid}`
- **Функция**: `api/fear.js`
- **Преимущества**: Нет проблем с CORS, стабильная работа

### Структура файлов

```
check-page-standalone/
├── api/
│   └── fear.js              # 🆕 Serverless функция для Fear API
├── css/
│   ├── base.css            # Базовые стили
│   ├── check.css           # Стили страницы проверки
│   ├── dashboard.css       # Стили дашборда
│   └── style.css           # Основные стили
├── js/
│   ├── APIClient.js        # API клиент
│   ├── CheckPage.js        # Логика страницы
│   ├── ConfigChecker.js    # Проверка config.vdf
│   ├── ModalManager.js     # Управление модалами
│   └── QuickSearch.js      # 🔄 Обновлено для новой API
├── index.html              # Главная страница
├── vercel.json             # 🔄 Обновлена конфигурация
└── DEPLOY.md               # Эта инструкция
```

---

## Деплой на Netlify

⚠️ **Внимание**: Netlify не поддерживает serverless функции в том же формате. Для полной функциональности используйте Vercel.

### Способ 1: Через Netlify CLI

1. Установите Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Войдите в аккаунт:
```bash
netlify login
```

3. Деплой:
```bash
cd check-page-standalone
netlify deploy --prod
```

### Способ 2: Через Netlify Dashboard

1. Зайдите на https://netlify.com
2. Перетащите папку `check-page-standalone` в окно браузера
3. Сайт автоматически задеплоится

---

## Деплой на GitHub Pages

⚠️ **Ограничение**: GitHub Pages не поддерживает serverless функции. Fear API работать не будет.

1. Создайте репозиторий на GitHub
2. Загрузите содержимое папки `check-page-standalone`
3. Зайдите в Settings → Pages
4. Выберите ветку (обычно `main`)
5. Сохраните
6. Сайт будет доступен по адресу: `https://username.github.io/repository-name/`

---

## Деплой на Cloudflare Pages

⚠️ **Ограничение**: Cloudflare Pages требует адаптации serverless функций под их формат.

1. Зайдите на https://pages.cloudflare.com
2. Нажмите "Create a project"
3. Подключите GitHub репозиторий или загрузите файлы напрямую
4. Cloudflare автоматически задеплоит сайт

---

## 🔧 API и функциональность

### ✅ Что работает

1. **Steam API** - работает везде (публичный API)
2. **UMA.SU API** - работает везде (WebSocket)
3. **Fear API** - работает только на Vercel (serverless функция)

### Fear API Endpoint

```
GET /api/fear?q={steamid}&page=1&limit=10&type=1
```

**Параметры:**
- `q`: Steam ID (17 цифр, обязательно)
- `page`: Номер страницы (по умолчанию: 1)
- `limit`: Результатов на страницу (по умолчанию: 10)
- `type`: Тип наказания (по умолчанию: 1)

**Пример ответа:**
```json
{
  "total": "1",
  "page": 1,
  "limit": 10,
  "punishments": [
    {
      "id": 130302,
      "steamid": "76561199881908264",
      "name": "player_name",
      "reason": "Игрок отказался от проверки",
      "status": 1,
      "expires": 1781443868
    }
  ]
}
```

---

## 🧪 Проверка после деплоя

1. Откройте задеплоенный сайт
2. Проверьте консоль браузера (F12) на ошибки
3. Попробуйте:
   - ✅ Загрузить config.vdf файл
   - ✅ Проверить Steam ID
   - ✅ Проверить Fear API (должно работать на Vercel)
   - ✅ Проверить UMA.SU API

### Тестовые данные

- **Steam ID с баном**: `76561199881908264`
- **Steam ID без бана**: `76561198000000000`

---

## 🚨 Устранение неполадок

### Fear API не работает

1. **На Vercel**: Проверьте логи функции в Vercel Dashboard
2. **На других платформах**: Fear API не будет работать без serverless функции
3. **Решение**: Используйте Vercel или создайте свой прокси сервер

### UMA.SU не работает

1. Проверьте WebSocket соединение в консоли браузера
2. Убедитесь что `wss://yooma.su/api` доступен
3. Проверьте настройки сети/файрвола

### CSS не загружается

1. Убедитесь что `base.css` существует в папке `css/`
2. Проверьте логи сборки на платформе
3. Очистите кэш браузера

---

## 🎯 Рекомендации

### Для полной функциональности:
**Используйте Vercel** - поддерживает все возможности

### Для простого деплоя:
**Любая платформа** - но Fear API работать не будет

### Для кастомизации:
**Создайте свой прокси сервер** и обновите API endpoints

---

## 🚀 Быстрый старт

Самый простой способ с полной функциональностью:
```bash
cd check-page-standalone
vercel
```

Готово! 🎉

**URL для тестирования**: Vercel предоставит URL после деплоя