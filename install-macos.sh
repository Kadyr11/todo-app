#!/bin/bash

# Todo App - Скрипт автоматической установки для macOS

echo "🚀 Установка Todo App для macOS"
echo "================================="

# Проверка macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Этот скрипт предназначен только для macOS"
    exit 1
fi

# Функция для проверки команды
check_command() {
    if command -v "$1" &> /dev/null; then
        echo "✅ $1 уже установлен"
        return 0
    else
        echo "❌ $1 не найден"
        return 1
    fi
}

# Проверка Homebrew
echo -e "\n📦 Проверка Homebrew..."
if ! check_command brew; then
    echo "🔧 Установка Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Добавление Homebrew в PATH для Apple Silicon Macs
    if [[ -f "/opt/homebrew/bin/brew" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
fi

# Проверка Node.js
echo -e "\n📦 Проверка Node.js..."
if ! check_command node; then
    echo "🔧 Установка Node.js..."
    brew install node
fi

# Проверка npm
echo -e "\n📦 Проверка npm..."
check_command npm

# Проверка Docker
echo -e "\n🐳 Проверка Docker..."
if ! check_command docker; then
    echo "🔧 Установка Docker..."
    brew install --cask docker
    echo "⚠️  ВАЖНО: После установки Docker:"
    echo "   1. Найдите Docker в Applications и запустите"
    echo "   2. Дождитесь полной загрузки (значок в menu bar)"
    echo "   3. Перезапустите терминал"
fi

# Версии установленных инструментов
echo -e "\n📋 Проверка версий..."
echo "Node.js: $(node --version 2>/dev/null || echo 'не установлен')"
echo "npm: $(npm --version 2>/dev/null || echo 'не установлен')"
echo "Docker: $(docker --version 2>/dev/null || echo 'не установлен или не запущен')"

# Установка зависимостей проекта
echo -e "\n📦 Установка зависимостей проекта..."

if [ -d "backend" ]; then
    echo "🔧 Backend зависимости..."
    cd backend && npm install && cd ..
    echo "✅ Backend зависимости установлены"
else
    echo "❌ Папка backend не найдена"
fi

if [ -d "frontend" ]; then
    echo "🔧 Frontend зависимости..."
    cd frontend && npm install && cd ..
    echo "✅ Frontend зависимости установлены"
else
    echo "❌ Папка frontend не найдена"
fi

echo -e "\n🎉 Установка завершена!"
echo -e "\n📋 Следующие шаги:"
echo "1. Если Docker установился впервые - запустите Docker Desktop"
echo "2. Перезапустите терминал"
echo "3. Запустите приложение:"
echo "   docker compose up --build"
echo ""
echo "🌐 После запуска:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"