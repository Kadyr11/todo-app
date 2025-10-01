# 🚀 Быстрый старт Todo App

## 📋 Что нужно для запуска

### Минимальные требования:
- **macOS** (этот гайд)
- **Docker Desktop** (будет установлен автоматически)
- **Node.js 18+** (будет установлен автоматически)

## ⚡ Автоматическая установка (1 команда)

\`\`\`bash
# Перейти в папку проекта
cd /Users/meri_esh/Desktop/Курс/todo-app

# Автоматическая установка всех зависимостей
./install-macos.sh
\`\`\`

## 🏃‍♂️ Запуск приложения

### Вариант 1: Docker (Рекомендуемый)
\`\`\`bash
# Development режим с hot reload
npm run dev

# Production режим  
npm run prod

# В фоновом режиме
npm run dev:bg
\`\`\`

### Вариант 2: Если Docker не работает
\`\`\`bash
# Установить зависимости
npm run install:all

# Запуск PostgreSQL в Docker
docker run --name postgres -e POSTGRES_DB=todoapp -e POSTGRES_PASSWORD=postgres123 -p 5432:5432 -d postgres:15-alpine

# Запуск backend (новый терминал)
npm run backend:dev

# Запуск frontend (еще один новый терминал)  
npm run frontend:dev
\`\`\`

## 🌐 Открыть приложение

После запуска откройте в браузере:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 🔍 Проверка системы

\`\`\`bash
# Проверить готовность системы
./check-system.sh

# Посмотреть логи
npm run logs
\`\`\`

## 🛑 Остановка

\`\`\`bash
# Остановить все сервисы
npm run stop

# Или для dev режима
npm run stop:dev
\`\`\`

## 📚 Документация

- **README.md** - Основная документация
- **SETUP.md** - Подробные инструкции
- **COMPLETE.md** - Полное описание системы

## 🆘 Проблемы?

1. **Docker не работает**: Запустите Docker Desktop
2. **Порты заняты**: Остановите процессы на портах 3000, 3001, 5432
3. **Node.js не найден**: Выполните \`./install-macos.sh\`

**🎉 Готово! Наслаждайтесь полнофункциональной Todo системой!**