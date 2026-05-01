# Fear Protection - Страница Проверки (Standalone)

Оптимизированная автономная версия страницы проверки игроков из Fear Protection Dashboard.

## ✨ Что изменено

- ❌ Убрана навигация (Главная, Античит)
- ❌ Убрана история проверок
- ❌ Убран футер
- ✅ Оставлена проверка config.vdf
- ✅ Оставлена проверка по Steam ID
- ✅ Упрощенный интерфейс (1 колонка вместо 3)

## 🚀 Быстрый старт

### Локальный запуск

```bash
# Windows (CMD)
start-local.bat

# Windows (PowerShell)
.\start-local.ps1

# Linux/Mac
chmod +x start-local.sh
./start-local.sh
```

Или вручную:
```bash
npm install
npm start
```

Откройте браузер: http://localhost:3002

### Деплой на Vercel

```bash
npm install -g vercel
vercel
```

Или перетащите папку на https://vercel.com

## 📁 Содержимое

- `index.html` - Главная страница проверки
- `app.ico`, `9574.ico` - Иконки сайта
- `css/` - Все стили
- `js/` - JavaScript модули:
  - `APIClient.js` - Клиент для API запросов
  - `ModalManager.js` - Управление модальными окнами
  - `ConfigChecker.js` - Проверка config.vdf файлов
  - `CheckPage.js` - Основная логика страницы
- `api/` - Serverless функции для Vercel:
  - `fear.js` - API для проверки банов
  - `player.js` - API для получения данных игрока
- `vercel.json` - Конфигурация Vercel
- `package.json` - Зависимости Node.js

## 🔧 Функции

### 1. Проверка config.vdf
- Перетащите файл config.vdf в область загрузки
- Или нажмите "Выбрать файл"
- Система проанализирует конфигурацию и покажет результаты

### 2. Проверка по Steam ID
- Введите Steam ID в поле поиска
- Нажмите "Проверить"
- Получите полную информацию об игроке:
  - Профиль Steam
  - VAC баны
  - Возраст аккаунта
  - Уровень риска

## 📝 Примечания

- Для работы с API требуется прокси сервер (уже настроен)
- Steam API ключ уже встроен в код
- Все данные обрабатываются на клиенте

## 🚀 Деплой

Подробная инструкция по деплою в файле [DEPLOY.md](DEPLOY.md)

### Быстрый деплой на Vercel:
```bash
npm install -g vercel
cd check-page-standalone
vercel
```

### Или просто перетащите папку на:
- https://vercel.com (Drag & Drop)
- https://netlify.com (Drag & Drop)
- https://pages.cloudflare.com (Drag & Drop)

## 📦 Зависимости

- Google Fonts (Inter) - загружается автоматически
- Express.js - для локального сервера
- http-proxy-middleware - для проксирования API

## 🎨 Кастомизация

Вы можете изменить:
- Цвета в `css/check.css`
- Логотип в `index.html`
- API endpoints в `js/APIClient.js`

## 📄 Лицензия

Свободное использование для любых целей.

## 🔗 Ссылки

- Основной проект: https://fearproject.ru
- Discord поддержка: https://discord.gg/QcBKPYUFYS
- Инструкции по исправлению: [INSTRUCTIONS.md](INSTRUCTIONS.md)