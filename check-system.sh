#!/bin/bash

# Todo App - Проверка готовности системы

echo "🔍 Todo App - Проверка готовности системы"
echo "========================================="

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция проверки
check_requirement() {
    local name="$1"
    local command="$2"
    local min_version="$3"
    
    echo -n "Проверка $name... "
    
    if command -v "$command" &> /dev/null; then
        local version=$(eval "$command --version 2>/dev/null | head -n1")
        echo -e "${GREEN}✅ Установлен${NC}"
        echo "   Версия: $version"
        return 0
    else
        echo -e "${RED}❌ Не найден${NC}"
        return 1
    fi
}

# Проверка операционной системы
echo -e "\n🖥️  Операционная система:"
echo "   $(uname -s) $(uname -r)"

# Проверка требований
echo -e "\n📋 Проверка требований:"

check_requirement "Node.js" "node" "18"
NODE_OK=$?

check_requirement "npm" "npm" "8"
NPM_OK=$?

check_requirement "Docker" "docker" "20"
DOCKER_OK=$?

echo -e "\n🐳 Проверка Docker состояния:"
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        echo -e "   ${GREEN}✅ Docker запущен и работает${NC}"
        DOCKER_RUNNING=0
    else
        echo -e "   ${YELLOW}⚠️  Docker установлен, но не запущен${NC}"
        echo "   Запустите Docker Desktop"
        DOCKER_RUNNING=1
    fi
else
    echo -e "   ${RED}❌ Docker не установлен${NC}"
    DOCKER_RUNNING=1
fi

# Проверка структуры проекта
echo -e "\n📁 Проверка структуры проекта:"

PROJECT_STRUCTURE=0

if [ -f "package.json" ]; then
    echo -e "   ${GREEN}✅ package.json${NC}"
else
    echo -e "   ${RED}❌ package.json не найден${NC}"
    PROJECT_STRUCTURE=1
fi

if [ -d "backend" ] && [ -f "backend/package.json" ]; then
    echo -e "   ${GREEN}✅ backend/package.json${NC}"
else
    echo -e "   ${RED}❌ backend/package.json не найден${NC}"
    PROJECT_STRUCTURE=1
fi

if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    echo -e "   ${GREEN}✅ frontend/package.json${NC}"
else
    echo -e "   ${RED}❌ frontend/package.json не найден${NC}"
    PROJECT_STRUCTURE=1
fi

if [ -f "docker-compose.yml" ]; then
    echo -e "   ${GREEN}✅ docker-compose.yml${NC}"
else
    echo -e "   ${RED}❌ docker-compose.yml не найден${NC}"
    PROJECT_STRUCTURE=1
fi

if [ -f "docker-compose.dev.yml" ]; then
    echo -e "   ${GREEN}✅ docker-compose.dev.yml${NC}"
else
    echo -e "   ${RED}❌ docker-compose.dev.yml не найден${NC}"
    PROJECT_STRUCTURE=1
fi

# Проверка зависимостей проекта
echo -e "\n📦 Проверка зависимостей проекта:"

if [ -d "backend/node_modules" ]; then
    echo -e "   ${GREEN}✅ Backend зависимости установлены${NC}"
    BACKEND_DEPS=0
else
    echo -e "   ${YELLOW}⚠️  Backend зависимости не установлены${NC}"
    echo "   Выполните: cd backend && npm install"
    BACKEND_DEPS=1
fi

if [ -d "frontend/node_modules" ]; then
    echo -e "   ${GREEN}✅ Frontend зависимости установлены${NC}"
    FRONTEND_DEPS=0
else
    echo -e "   ${YELLOW}⚠️  Frontend зависимости не установлены${NC}"
    echo "   Выполните: cd frontend && npm install"
    FRONTEND_DEPS=1
fi

# Итоговая оценка
echo -e "\n📊 Итоговая оценка готовности:"

TOTAL_SCORE=0
MAX_SCORE=7

if [ $NODE_OK -eq 0 ]; then ((TOTAL_SCORE++)); fi
if [ $NPM_OK -eq 0 ]; then ((TOTAL_SCORE++)); fi
if [ $DOCKER_OK -eq 0 ]; then ((TOTAL_SCORE++)); fi
if [ $DOCKER_RUNNING -eq 0 ]; then ((TOTAL_SCORE++)); fi
if [ $PROJECT_STRUCTURE -eq 0 ]; then ((TOTAL_SCORE++)); fi
if [ $BACKEND_DEPS -eq 0 ]; then ((TOTAL_SCORE++)); fi
if [ $FRONTEND_DEPS -eq 0 ]; then ((TOTAL_SCORE++)); fi

echo "   Готовность: $TOTAL_SCORE/$MAX_SCORE"

if [ $TOTAL_SCORE -eq $MAX_SCORE ]; then
    echo -e "   ${GREEN}🎉 Система полностью готова к запуску!${NC}"
    echo -e "\n🚀 Команды для запуска:"
    echo "   Production:  docker compose up --build"
    echo "   Development: docker compose -f docker-compose.dev.yml up --build"
    echo "   Локально:    npm run dev (в папках backend и frontend)"
elif [ $TOTAL_SCORE -ge 5 ]; then
    echo -e "   ${YELLOW}⚠️  Система почти готова, устраните указанные проблемы${NC}"
else
    echo -e "   ${RED}❌ Система не готова, требуется установка зависимостей${NC}"
    echo -e "\n🔧 Для автоматической установки выполните:"
    echo "   ./install-macos.sh"
fi

echo -e "\n📖 Полная документация в файлах:"
echo "   README.md - Основная документация"
echo "   SETUP.md  - Подробные инструкции по установке"