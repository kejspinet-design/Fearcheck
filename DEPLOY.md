# Деплой на Vercel

## Быстрый деплой

### Вариант 1: Через Vercel CLI
```bash
npm install -g vercel
cd check-page-standalone
vercel
```

### Вариант 2: Через веб-интерфейс Vercel
1. Перейдите на https://vercel.com
2. Нажмите "Add New" → "Project"
3. Импортируйте репозиторий GitHub или перетащите папку `check-page-standalone`
4. Настройки будут автоматически определены из `vercel.json`

### Вариант 3: Через Git
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/fear-protection-check.git
git push -u origin main
# Затем импортируйте репозиторий в Vercel
```

## Структура проекта для Vercel

```
check-page-standalone/
├── api/                    # Serverless функции Vercel
│   ├── fear.js            # API для проверки банов
│   └── player.js           # API для получения данных игрока
├── css/                   # Стили
├── js/                    # JavaScript модули
├── index.html            # Главная страница
├── vercel.json           # Конфигурация Vercel
├── package.json          # Зависимости Node.js
└── README.md             # Документация
```

## API Endpoints

### 1. Проверка банов
```
GET /api/fear?q=STEAM_ID&page=1&limit=10&type=1
```
- `q` - Steam ID игрока (обязательно)
- `page` - номер страницы (по умолчанию 1)
- `limit` - количество результатов (по умолчанию 10)
- `type` - тип наказания (по умолчанию 1)

### 2. Получение данных игрока
```
GET /api/player?steamid=STEAM_ID&mode=public
```
- `steamid` - Steam ID игрока (обязательно)
- `mode` - режим данных (public/private)

## Локальная разработка

### Установка зависимостей
```bash
npm install
```

### Запуск локального сервера
```bash
npm start
# или
node server.js
```

### Тестирование API
```bash
# Проверка API банов
curl "http://localhost:3002/api/fear?q=76561199881908264"

# Проверка API данных игрока
curl "http://localhost:3002/api/player?steamid=76561199881908264"
```

## Решение проблем

### 1. Ошибка CORS
Если возникают ошибки CORS, убедитесь что:
- API endpoints правильно настроены в `vercel.json`
- Заголовки CORS установлены в serverless функциях
- Браузер не блокирует запросы

### 2. Ошибка 404 для API
Проверьте:
- Файлы в папке `api/` существуют
- Маршруты в `vercel.json` правильно настроены
- Имена файлов совпадают с маршрутами

### 3. Медленная работа
Оптимизации:
- Кэширование результатов в браузере
- Параллельная проверка игроков
- Ограничение количества запросов

### 4. Ошибка авторизации
Проверьте:
- Access token в файле `js/CheckPage.js`
- Срок действия токена
- Права доступа к Fear Project API

## Мониторинг и логи

### Vercel Dashboard
- Перейдите на https://vercel.com/dashboard
- Выберите проект
- Просмотрите логи в разделе "Functions"

### Локальные логи
```bash
# Просмотр логов сервера
npm start 2>&1 | tee server.log

# Просмотр логов браузера
# Откройте консоль разработчика (F12)
```

## Обновление проекта

### Обновление зависимостей
```bash
npm update
```

### Обновление API токена
1. Откройте файл `js/CheckPage.js`
2. Обновите значение `accessToken`
3. Перезапустите сервер

### Обновление конфигурации Vercel
1. Отредактируйте файл `vercel.json`
2. Передеплойте проект
```bash
vercel --prod
```

## Контакты поддержки

При возникновении проблем:
1. Откройте консоль браузера (F12)
2. Сделайте скриншот ошибок
3. Обратитесь в Discord: https://discord.gg/QcBKPYUFYS

## Лицензия

Свободное использование для любых целей.