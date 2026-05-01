@echo off
echo Запуск локального сервера Fear Protection Check...
echo.

REM Проверка установки Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Ошибка: Node.js не установлен!
    echo Установите Node.js с https://nodejs.org/
    pause
    exit /b 1
)

REM Проверка установки npm
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo Ошибка: npm не установлен!
    echo Установите Node.js (включая npm) с https://nodejs.org/
    pause
    exit /b 1
)

REM Установка зависимостей
echo Установка зависимостей...
call npm install
if %errorlevel% neq 0 (
    echo Ошибка при установке зависимостей!
    pause
    exit /b 1
)

REM Запуск сервера
echo Запуск сервера...
echo.
echo ============================================
echo Сервер запущен на http://localhost:3002
echo ============================================
echo.
echo Откройте браузер и перейдите по адресу:
echo http://localhost:3002
echo.
echo Для остановки сервера нажмите Ctrl+C
echo ============================================
echo.

call npm start

pause