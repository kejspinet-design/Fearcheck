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
6. Vercel автоматически определит настройки
7. Нажмите "Deploy"

### Способ 3: Через Vercel Dashboard (Drag & Drop)

1. Зайдите на https://vercel.com
2. Нажмите "Add New..." → "Project"
3. Перетащите папку `check-page-standalone` в окно браузера
4. Vercel автоматически задеплоит сайт

---

## Деплой на Netlify

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

1. Создайте репозиторий на GitHub
2. Загрузите содержимое папки `check-page-standalone`
3. Зайдите в Settings → Pages
4. Выберите ветку (обычно `main`)
5. Сохраните
6. Сайт будет доступен по адресу: `https://username.github.io/repository-name/`

---

## Деплой на Cloudflare Pages

1. Зайдите на https://pages.cloudflare.com
2. Нажмите "Create a project"
3. Подключите GitHub репозиторий или загрузите файлы напрямую
4. Cloudflare автоматически задеплоит сайт

---

## Важные замечания

### ⚠️ API и CORS

Эта страница использует Steam API и Fear API. При деплое на статический хостинг:

1. **Steam API** - работает напрямую (публичный API)
2. **Fear API** - требует прокси сервер из-за CORS

### Решение для Fear API:

**Вариант 1**: Задеплоить прокси сервер отдельно
- Используйте Heroku, Railway, или Render для `proxy-server.js`
- Обновите `js/APIClient.js` с новым URL прокси

**Вариант 2**: Использовать только Steam API
- Уберите функционал, зависящий от Fear API
- Оставьте только проверку по Steam ID

**Вариант 3**: Использовать CORS Proxy сервис
- Например: https://cors-anywhere.herokuapp.com
- Или создайте свой на Cloudflare Workers

### Обновление API URL

Если вы деплоите прокси сервер отдельно, обновите в `js/APIClient.js`:

```javascript
this.config = {
    fearApiBase: 'https://your-proxy-server.com/api/fear',
    steamApiBase: 'https://your-proxy-server.com/api/steam',
    // ...
};
```

---

## Проверка после деплоя

1. Откройте задеплоенный сайт
2. Проверьте консоль браузера (F12) на ошибки
3. Попробуйте:
   - Загрузить config.vdf файл
   - Проверить Steam ID
4. Если есть ошибки CORS - настройте прокси сервер

---

## Поддержка

Если возникли проблемы:
1. Проверьте консоль браузера (F12)
2. Убедитесь что все файлы загружены
3. Проверьте пути к файлам (должны быть относительными)
4. Проверьте работу API

---

## Быстрый старт

Самый простой способ:
```bash
cd check-page-standalone
vercel
```

Готово! 🎉