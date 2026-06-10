#!/bin/bash

echo "Запуск локального сервера Fear Protection Check..."
echo ""

# Проверка установки Node.js
if ! command -v node &> /dev/null; then
    echo "Ошибка: Node.js не установлен!"
    echo "Установите Node.js с https://nodejs.org/"
    read -p "Нажмите Enter для выхода"
    exit 1
fi

# Проверка установки npm
if ! command -v npm &> /dev/null; then
    echo "Ошибка: npm не установлен!"
    echo "Установите Node.js (включая npm) с https://nodejs.org/"
    read -p "Нажмите Enter для выхода"
    exit 1
fi

# Установка зависимостей
echo "Установка зависимостей..."
npm install
if [ $? -ne 0 ]; then
    echo "Ошибка при установке зависимостей!"
    read -p "Нажмите Enter для выхода"
    exit 1
fi

# Запуск сервера
echo "Запуск сервера..."
echo ""
echo "============================================"
echo "Сервер запущен на http://localhost:3002"
echo "============================================"
echo ""
echo "Откройте браузер и перейдите по адресу:"
echo "http://localhost:3002"
echo ""
echo "Для остановки сервера нажмите Ctrl+C"
echo "============================================"
echo ""

npm start