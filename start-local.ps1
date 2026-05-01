Write-Host "Запуск локального сервера Fear Protection Check..." -ForegroundColor Green
Write-Host ""

# Проверка установки Node.js
try {
    Get-Command node -ErrorAction Stop | Out-Null
} catch {
    Write-Host "Ошибка: Node.js не установлен!" -ForegroundColor Red
    Write-Host "Установите Node.js с https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

# Проверка установки npm
try {
    Get-Command npm -ErrorAction Stop | Out-Null
} catch {
    Write-Host "Ошибка: npm не установлен!" -ForegroundColor Red
    Write-Host "Установите Node.js (включая npm) с https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

# Установка зависимостей
Write-Host "Установка зависимостей..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка при установке зависимостей!" -ForegroundColor Red
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

# Запуск сервера
Write-Host "Запуск сервера..." -ForegroundColor Cyan
Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "Сервер запущен на http://localhost:3002" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Откройте браузер и перейдите по адресу:" -ForegroundColor Yellow
Write-Host "http://localhost:3002" -ForegroundColor Cyan
Write-Host ""
Write-Host "Для остановки сервера нажмите Ctrl+C" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

npm start