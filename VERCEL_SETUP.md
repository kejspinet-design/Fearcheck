# 🚀 Настройка Vercel Environment Variables

## ⚠️ КРИТИЧЕСКИ ВАЖНО!

Без этих настроек сайт НЕ БУДЕТ РАБОТАТЬ!

---

## Шаг 1: Зайди в Vercel Dashboard

1. Открой: https://vercel.com/dashboard
2. Найди свой проект (Fearcheck или reafsavers)
3. Кликни на проект

---

## Шаг 2: Открой Settings

1. В верхнем меню найди **Settings**
2. Кликни на **Settings**

---

## Шаг 3: Открой Environment Variables

1. В левом меню найди **Environment Variables**
2. Кликни на **Environment Variables**

---

## Шаг 4: Добавь 3 переменные

### Переменная 1: FEAR_ACCESS_TOKEN

1. **Key:** `FEAR_ACCESS_TOKEN`
2. **Value:** 
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiI3NjU2MTE5OTUyNDc4MDMyNyIsImlhdCI6MTc4MTUyMDQwNCwiZXhwIjoxNzg0MTEyNDA0fQ.mRPdNR_NwLZA4n3SaQaJZR2n2CVa7-PEuG1zDaBAKCc
```
3. **Environment:** Production, Preview, Development (выбери все)
4. Нажми **Save**

---

### Переменная 2: STEAM_API_KEY

1. **Key:** `STEAM_API_KEY`
2. **Value:** 
```
4CE8017CEC2702E4A9200A4BAD93513E
```
3. **Environment:** Production, Preview, Development (выбери все)
4. Нажми **Save**

---

### Переменная 3: NODE_ENV

1. **Key:** `NODE_ENV`
2. **Value:** `production`
3. **Environment:** Production, Preview, Development (выбери все)
4. Нажми **Save**

---

## Шаг 5: Redeploy проект

1. Вернись в **Deployments** (вкладка вверху)
2. Найди последний деплой
3. Нажми кнопку **⋯** (три точки)
4. Выбери **Redeploy**
5. Подтверди **Redeploy**

---

## Шаг 6: Дождись завершения

1. Дождись окончания деплоя (~2 минуты)
2. Статус должен стать **Ready** ✅
3. Если ошибка - смотри логи

---

## ✅ Проверка

Открой сайт:
- https://reafsavers.vercel.app

Должно работать:
- ✅ Главная страница загружается
- ✅ Список серверов появляется
- ✅ Страница tracking работает
- ✅ Нет ошибок в консоли браузера (F12)

---

## 🐛 Если не работает

### Проверь в DevTools (F12 → Network):

1. Открой Network tab
2. Обнови страницу
3. Найди запрос к `/api/proxy?endpoint=servers`
4. Посмотри статус:
   - ✅ **200 OK** - всё работает
   - ❌ **500 Error** - проверь переменные окружения
   - ❌ **404 Not Found** - проверь что proxy.js задеплоился

### Если 500 Error:

1. Зайди в Vercel Dashboard
2. Deployments → Последний деплой
3. Functions → proxy
4. Посмотри логи
5. Скорее всего переменные окружения не установлены

### Если всё равно не работает:

1. Проверь что все 3 переменные добавлены
2. Проверь что в значениях нет лишних пробелов
3. Попробуй Redeploy ещё раз
4. Подожди 5 минут (кэш Vercel)

---

## 📊 Что исправлено

### Проблема:
❌ **"No more than 12 Serverless Functions on Hobby plan"**

### Решение:
✅ Объединил 5 API файлов в 1 универсальный `proxy.js`

### Было:
- api/fear-servers.js
- api/reports-recent.js  
- api/player.js
- api/uma.js
- api/avatar-proxy.js

### Стало:
- api/proxy.js (один файл для всех эндпоинтов)

---

## 🎯 Итог

После настройки переменных окружения:
- ✅ Сайт будет полностью работать
- ✅ Все API запросы работают
- ✅ Security исправления применены
- ✅ Готов к production

---

**Время настройки:** ~5 минут  
**Статус:** 🟢 Ready for production
