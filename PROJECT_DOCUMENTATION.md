# Todo App - Полная Документация

## 📁 Структура проекта

```
todo-app/
├─ api/                          # Backend (Node.js + TypeScript + Prisma)
│  ├─ src/
│  │  ├─ controllers/           # Контроллеры API
│  │  │  ├─ todoController.ts
│  │  │  ├─ projectController.ts
│  │  │  └─ sectionController.ts
│  │  ├─ routes/               # Маршруты API
│  │  │  ├─ todoRoutes.ts
│  │  │  ├─ projectRoutes.ts
│  │  │  └─ sectionRoutes.ts
│  │  ├─ lib/                  # Библиотеки
│  │  │  └─ prisma.ts
│  │  ├─ app.ts               # Конфигурация Express
│  │  ├─ server.ts            # HTTP сервер
│  │  ├─ index.ts             # Точка входа
│  │  ├─ database.ts          # Настройки БД
│  │  └─ types.ts             # TypeScript типы
│  ├─ prisma/
│  │  ├─ schema.prisma        # Схема базы данных
│  │  ├─ seed.ts              # Данные для заполнения БД
│  │  └─ migrations/          # Миграции БД
│  │     ├─ 20241223000001_init/
│  │     ├─ 20250925160226_add_missing_fields/
│  │     ├─ 20251007023000_add_deleted_at/
│  │     ├─ 20251007024000_add_missing_tables/
│  │     └─ 20251007024500_add_section_id/
│  ├─ Dockerfile              # Docker-образ для API
│  ├─ docker-entrypoint.sh    # Скрипт запуска контейнера
│  ├─ package.json            # Зависимости Node.js
│  └─ tsconfig.json           # Конфигурация TypeScript
│
├─ web/                        # Frontend (React + TypeScript + Vite)
│  ├─ src/
│  │  ├─ components/          # React компоненты
│  │  │  ├─ Layout.tsx
│  │  │  ├─ TodoItem.tsx
│  │  │  ├─ TodoForm.tsx
│  │  │  ├─ Sidebar.tsx
│  │  │  ├─ Topbar.tsx
│  │  │  ├─ CalendarView.tsx
│  │  │  ├─ SettingsPanel.tsx
│  │  │  └─ ...
│  │  ├─ pages/               # Страницы приложения
│  │  │  ├─ ArchivedProjectsPage.tsx
│  │  │  └─ DeletedTodosPage.tsx
│  │  ├─ contexts/            # React контексты
│  │  │  └─ SettingsContext.tsx
│  │  ├─ hooks/               # Пользовательские хуки
│  │  │  └─ useCalendarNotes.ts
│  │  ├─ App.tsx              # Основной компонент
│  │  ├─ main.tsx             # Точка входа React
│  │  ├─ api.ts               # API клиент
│  │  ├─ types.ts             # TypeScript типы
│  │  ├─ i18n.ts              # Интернационализация
│  │  └─ theme.css            # CSS стили
│  ├─ public/
│  │  └─ logo.svg
│  ├─ Dockerfile              # Docker-образ для frontend
│  ├─ vite.config.ts          # Конфигурация Vite
│  ├─ package.json            # Зависимости Node.js
│  └─ tsconfig.json           # Конфигурация TypeScript
│
├─ database/
│  └─ init.sql                # Начальная настройка PostgreSQL
│
├─ docker-compose.yml         # Оркестрация контейнеров
├─ docker-compose.dev.yml     # Конфигурация для разработки
├─ .env.example               # Пример переменных окружения
├─ .env                       # Переменные окружения (не в git)
├─ package.json               # Общие зависимости и скрипты
├─ tsconfig.base.json         # Базовая конфигурация TypeScript
└─ README.md                  # Документация проекта
```

## 🎯 Цель проекта

**Todo App** - это полнофункциональное приложение для управления задачами с поддержкой:

- ✅ Создание, редактирование и удаление задач
- 📁 Организация задач по проектам и секциям
- 📅 Календарный вид и планирование
- 🗑️ Корзина для удаленных задач
- 🎨 Настройки интерфейса и темы
- 🌐 Мультиязычность (русский/английский)
- 📱 Адаптивный дизайн

**Назначение**: Личное управление задачами и планирование проектов

## 🛠️ Технологический стек

### Backend
- **Node.js 20** - Серверная платформа
- **TypeScript** - Типизированный JavaScript
- **Express.js** - Веб-фреймворк
- **Prisma 5.22.0** - ORM для работы с базой данных
- **PostgreSQL 15** - Реляционная база данных

### Frontend
- **React 18** - UI библиотека
- **TypeScript** - Типизированный JavaScript
- **Vite** - Сборщик и dev-сервер
- **CSS3** - Стилизация

### DevOps
- **Docker & Docker Compose** - Контейнеризация
- **nginx** - Веб-сервер для frontend
- **Git** - Система контроля версий

## ⚙️ Конфигурации

### docker-compose.yml
```yaml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: todo
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build: ./api
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/todo
      NODE_ENV: production
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  web:
    build: ./web
    ports:
      - "5173:5173"
    depends_on:
      - api

volumes:
  db_data:
```

### Schema Prisma (api/prisma/schema.prisma)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Todo {
  id          Int       @id @default(autoincrement())
  title       String    @db.VarChar(255)
  description String?   @db.Text
  completed   Boolean   @default(false)
  status      Status    @default(PENDING)
  priority    Priority  @default(MEDIUM)
  dueDate     DateTime? @map("due_date")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")
  sectionId   Int?      @map("section_id")
  section     Section?  @relation(fields: [sectionId], references: [id], onDelete: SetNull)

  @@map("todos")
}

model Section {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(100)
  description String?  @db.Text
  position    Int      @default(0)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  projectId   Int      @map("project_id")
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  todos       Todo[]

  @@map("sections")
}

model Project {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(100)
  description String?  @db.Text
  color       String?  @db.VarChar(7)
  archived    Boolean  @default(false)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  sections    Section[]

  @@map("projects")
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum Status {
  PENDING
  DONE
}
```

### Переменные окружения (.env)
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todo"

# API
NODE_ENV=development
PORT=3001

# Frontend
VITE_API_URL=http://localhost:3001/api
```

### Vite конфигурация (web/vite.config.ts)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
```

## 🚀 Команды запуска

### Разработка
```bash
# Запуск всех сервисов
docker compose up -d

# Только база данных
docker compose up -d db

# Применение миграций
docker compose run --rm api npx prisma migrate deploy

# Генерация Prisma Client
docker compose run --rm api npx prisma generate

# Просмотр логов
docker compose logs -f api
docker compose logs -f web
```

### Производство
```bash
# Сборка и запуск
docker compose -f docker-compose.yml up -d --build

# Остановка
docker compose down

# Полная очистка
docker compose down -v --remove-orphans
```

## 🐛 Текущий статус и проблемы

### ✅ Что работает:
- Docker контейнеры запускаются успешно
- База данных PostgreSQL функционирует
- Prisma миграции применяются
- Frontend доступен на порту 5173
- Базовая структура API настроена

### ❌ Текущие проблемы:
1. **HTTP 500 ошибки API** - проблемы с отсутствующими таблицами/колонками в БД
2. **Несоответствие схемы Prisma и БД** - нужна синхронизация
3. **Отсутствие таблиц `projects` и `sections`** - созданы миграции, но не применены

### 🔧 Выполненные исправления:
- Создан `docker-entrypoint.sh` для корректной инициализации API
- Обновлен `Dockerfile` с поддержкой OpenSSL
- Добавлены health checks в `docker-compose.yml`
- Созданы миграции для отсутствующих таблиц и колонок
- Исправлен тип колонки `section_id` с TEXT на INTEGER

### 📋 Следующие шаги:
1. Синхронизировать Prisma схему с базой данных
2. Применить все созданные миграции
3. Протестировать API endpoints
4. Проверить работу frontend с API
5. Оптимизировать производительность

## 🔍 Диагностические команды

```bash
# Проверка статуса контейнеров
docker compose ps

# Проверка логов API
docker compose logs api --tail=50

# Проверка структуры БД
docker compose exec db psql -U postgres -d todo -c "\d+ todos"

# Статус миграций Prisma
docker compose run --rm api npx prisma migrate status

# Тестирование API
curl -i http://localhost:3001/api/todos

# Тестирование health check
curl -i http://localhost:3001/api/health
```

## 📝 История изменений

- **v1.0** - Базовая структура проекта
- **v1.1** - Добавлена Docker конфигурация
- **v1.2** - Исправлены проблемы с миграциями БД
- **v1.3** - Добавлена поддержка проектов и секций
- **v1.4** - Исправления API и синхронизация схемы (текущая версия)