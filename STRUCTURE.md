# 📁 Структура проекта Fear Protection (Standalone)

## 🗂️ Организация файлов

```
check-page-standalone/
├── 📄 index.html              # Главная страница
├── 📄 anticheat.html          # Страница "Игроки"
├── 📄 check.html              # Страница "Проверка"
│
├── 📁 assets/                 # Медиа файлы
│   ├── images/                # Иконки и изображения
│   │   ├── 9574.ico           # Основная иконка
│   │   └── app.ico            # Иконка приложения
│   └── sounds/                # Звуковые эффекты
│       ├── 1498374867383353515 (1).ogg  # Звук пасхалки
│       └── 538a2b7db66b5418.gif         # Дополнительный звук
│
├── 📁 pages/                  # HTML страницы
│   ├── secret-admins.html     # Страница админов (секретная)
│   ├── secret-login.html      # Страница входа (секретная)
│   ├── secret-menu.html       # Секретное меню
│   ├── secret-russians.html   # Список русских игроков (секретный)
│   ├── rules.html             # Правила (удалена из навигации)
│   ├── tracking.html          # Отслеживание (удалена из навигации)
│   └── watermelon.html        # Пасхалка с арбузом
│
├── 📁 api/                    # API endpoints (Vercel Serverless Functions)
│   ├── fear.js                # Прокси для Fear API
│   ├── uma.js                 # Прокси для UMA/yooma.su API
│   ├── player.js              # Информация об игроке
│   ├── punishments.js         # Список наказаний
│   ├── player-summaries.js    # Сводки игроков
│   └── admin/
│       └── punishments.js     # Админские операции с наказаниями
│
├── 📁 js/                     # JavaScript модули
│   ├── APIClient.js           # Клиент для API запросов
│   ├── AntiCheatPage.js       # Логика страницы "Игроки"
│   ├── ConfigChecker.js       # Проверка config.vdf (Fear)
│   ├── ConfigCheckerUMA.js    # Проверка config.vdf (Fear + UMA)
│   ├── FarewellModal.js       # Прощальное модальное окно
│   ├── easter-egg.js          # Пасхалка со звуком + защита от F12
│   ├── ModalManager.js        # Управление модальными окнами
│   ├── NotificationManager.js # Система уведомлений
│   ├── QuickSearch.js         # Быстрый поиск
│   └── rules-data.js          # Данные правил
│
├── 📁 css/                    # Стили
│   ├── base.css               # Базовые стили
│   ├── style.css              # Основные стили
│   ├── dashboard.css          # Стили дашборда
│   ├── check.css              # Стили страницы проверки
│   ├── fonts.css              # Подключение шрифтов
│   └── ...                    # Другие стили
│
├── 📁 scripts/                # Вспомогательные скрипты
│   ├── start-local.bat        # Запуск локального сервера (Windows CMD)
│   ├── start-local.ps1        # Запуск локального сервера (PowerShell)
│   ├── start-local.sh         # Запуск локального сервера (Linux/Mac)
│   ├── server.js              # Node.js сервер для разработки
│   └── yooma-proxy.js         # WebSocket прокси для yooma.su
│
├── 📁 tests/                  # Тесты Playwright
│   ├── bug-condition-exploration.spec.js
│   ├── preservation-properties.spec.js
│   └── ...
│
├── 📁 музыка/                 # Музыка (не используется после оптимизации)
│   ├── Дипинс - Этажи.mp3
│   └── button-click.ogg
│
├── 📁 фотки карт/             # Изображения карт CS
│   ├── de_dust2.jpg
│   ├── de_mirage.png
│   └── ...
│
├── 📁 fonts/                  # Шрифты
│   └── Calluna.ttf
│
├── 📄 package.json            # Зависимости Node.js
├── 📄 vercel.json             # Конфигурация Vercel
├── 📄 playwright.config.js    # Конфигурация Playwright
├── 📄 .env                    # Переменные окружения
├── 📄 .gitignore              # Игнорируемые файлы Git
├── 📄 README.md               # Документация проекта
├── 📄 CHANGELOG-STANDALONE.md # История изменений
└── 📄 STRUCTURE.md            # Этот файл (структура проекта)
```

## 🎯 Ключевые изменения в организации

### ✅ Что сделано:
1. **assets/** - Все медиа файлы (иконки, звуки) в одном месте
2. **pages/** - HTML страницы отделены от корня
3. **scripts/** - Скрипты запуска вынесены отдельно
4. Удалена дублирующая папка `check-page-standalone/check-page-standalone/`
5. Обновлены все пути в HTML и JS файлах

### 📋 Основные страницы:
- `index.html` - Главная (перенаправление)
- `anticheat.html` - Игроки (новореги)
- `check.html` - Проверка config.vdf

### 🔒 Секретные страницы (в `pages/`):
- Доступны через специальный логин
- Админская панель
- Список русских игроков

### 🎵 Пасхалки:
- Клик по иконке Fear Protection → звук
- Защита от F12 (DevTools заблокированы)

## 🚀 Запуск проекта

### Локальная разработка:
```bash
# Windows (PowerShell)
.\scripts\start-local.ps1

# Windows (CMD)
scripts\start-local.bat

# Linux/Mac
bash scripts/start-local.sh
```

### Production (Vercel):
- Автоматический деплой при push в GitHub
- Репозиторий: https://github.com/kejspinet-design/Fearcheck

## 📦 Технологии

- **Frontend:** Vanilla JavaScript, HTML, CSS
- **Backend:** Vercel Serverless Functions (Node.js)
- **Testing:** Playwright
- **APIs:** Fear API, UMA/yooma.su API
- **Deployment:** Vercel

## 🔧 Конфигурация

- `vercel.json` - Настройки Vercel (rewrites, headers, functions)
- `package.json` - Зависимости и скрипты
- `playwright.config.js` - Настройки тестов
- `.env` - Переменные окружения (не коммитится)
