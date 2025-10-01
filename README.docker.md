# Todo App - Docker Compose Setup

## Быстрый запуск всего проекта одной командой

```bash
# Из корневой папки проекта
docker compose up --build
```

## Структура сервисов

- **db**: PostgreSQL 16 на порту 5432 (база данных "todos")
- **api**: Node.js + Express + TypeScript + Prisma на порту 3000  
- **web**: Vite React frontend на порту 5173

## URL доступа

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Database: localhost:5432

## Переменные окружения

### Backend (.env)
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=todos
DATABASE_URL=postgresql://postgres:postgres@db:5432/todos?schema=public
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```

## Разработка без Docker

### Локальная PostgreSQL
```bash
# Установить PostgreSQL локально
brew install postgresql
createdb todos

# Обновить DATABASE_URL в .env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todos?schema=public
```

### Backend
```bash
cd backend
npm run dev  # http://localhost:3000
```

### Frontend  
```bash
cd frontend
npm run dev  # http://localhost:5173
```

## Полезные команды

```bash
# Запуск в фоне
docker compose up -d --build

# Остановка
docker compose down

# Перезапуск с пересборкой
docker compose down && docker compose up --build

# Логи
docker compose logs -f

# Только база данных
docker compose up db

# Очистка
docker compose down -v  # удаляет volumes
```

## Troubleshooting

1. **Порт занят**: Остановите другие сервисы на портах 3000, 5173, 5432
2. **База данных**: Дождитесь healthcheck PostgreSQL (30-60 сек)
3. **Network Error**: Проверьте что API доступен на http://localhost:3000
4. **Миграции**: База данных "todos" создается автоматически при первом запуске