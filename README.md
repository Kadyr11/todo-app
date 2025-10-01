# Todo App - Full Stack CRUD System

## 🚀 Описание проекта

Полнофункциональное Todo приложение с современным стеком технологий:

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript  
- **Database**: PostgreSQL
- **Контейнеризация**: Docker + Docker Compose

## 📋 Функциональность

### CRUD операции:
- ✅ **Create** - Создание новых задач
- ✅ **Read** - Просмотр списка задач
- ✅ **Update** - Редактирование задач и отметка как выполненные
- ✅ **Delete** - Удаление задач

### Дополнительные возможности:
- Разделение на активные и выполненные задачи
- Timestamps (дата создания и обновления)
- Валидация данных
- Responsive дизайн
- Обработка ошибок

## 🏗️ Архитектура проекта

```
todo-app/
├── frontend/          # React + TypeScript приложение
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── types.ts      # TypeScript типы
│   │   ├── api.ts        # API клиент
│   │   └── App.tsx       # Главный компонент
│   ├── Dockerfile        # Docker конфигурация для frontend
│   └── package.json      # Зависимости frontend
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── controllers/  # Контроллеры API
│   │   ├── routes/       # API роуты
│   │   ├── types.ts      # TypeScript типы
│   │   └── index.ts      # Точка входа
│   ├── Dockerfile        # Docker конфигурация для backend
│   └── package.json      # Зависимости backend
├── database/          # PostgreSQL конфигурация
│   └── init.sql          # SQL схема и тестовые данные
├── docker-compose.yml    # Production конфигурация
├── docker-compose.dev.yml # Development конфигурация
└── README.md         # Этот файл
```

## 🚀 Быстрый старт

### Предварительные требования
- [Docker](https://www.docker.com/get-started) 
- [Docker Compose](https://docs.docker.com/compose/install/)

### 1. Клонирование проекта
```bash
git clone <repository-url>
cd todo-app
```

## 🐳 Запуск в Docker

```bash
# Запуск всего стека
docker compose up --build

# Доступ к приложению:
# Фронт: http://localhost:5173
# API:   http://localhost:3000/health  -> { ok: true }
```

## 💻 Локальный dev (без Docker для фронта/бекенда)

```bash
# 1. Запуск только базы данных
docker compose up db

# 2. Настройка и запуск backend
cd backend
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todos?schema=public
npx prisma migrate deploy && npm run dev

# 3. Запуск frontend (в новом терминале)
cd frontend
VITE_API_URL=http://localhost:3000 npm run dev
```

## ⚠️ Важно: Не использовать Live Server!

**❌ НЕ запускайте через Live Server (порт 5500)**
- Live Server не поддерживает Vite конфигурацию
- Отсутствует прокси для API запросов
- Нет поддержки environment variables

**✅ Правильные способы запуска:**

1. **Vite dev-сервер (рекомендуется):**
   ```bash
   cd frontend
   npm run dev
   # Открыть: http://localhost:5173
   ```

2. **Production build:**
   ```bash
   cd frontend
   npm run build
   # Раздать frontend/dist через любой веб-сервер
   # Например: npx serve dist
   ```
docker compose up --build -d
```

## 🌐 Доступ к приложению

После успешного запуска:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/health
- **Database**: localhost:5432

### API Endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/todos` | Получить все задачи |
| GET | `/api/todos/:id` | Получить задачу по ID |
| POST | `/api/todos` | Создать новую задачу |
| PUT | `/api/todos/:id` | Обновить задачу |
| DELETE | `/api/todos/:id` | Удалить задачу |
| GET | `/health` | Health check API |

### Примеры API запросов

#### Создание задачи
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Изучить Docker",
    "description": "Освоить основы контейнеризации"
  }'
```

#### Обновление задачи
```bash
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }'
```

## 🛠️ Разработка

### Локальная разработка без Docker

#### Backend
```bash
cd backend
npm install
npm run dev  # Запуск с nodemon
```

#### Frontend
```bash
cd frontend
npm install
npm run dev  # Запуск Vite dev сервера
```

#### База данных
```bash
# Запуск только PostgreSQL
docker-compose up database
```

### Полезные команды Docker

```bash
# Просмотр логов
docker-compose logs -f

# Перестроить контейнеры
docker-compose up --build

# Остановить все сервисы
docker-compose down

# Удалить все данные (включая базу)
docker-compose down -v

# Запуск отдельного сервиса
docker-compose up database
```

## 🗄️ База данных

### Схема таблицы `todos`

| Поле | Тип | Описание |
|------|-----|----------|
| id | SERIAL PRIMARY KEY | Уникальный идентификатор |
| title | VARCHAR(255) NOT NULL | Заголовок задачи |
| description | TEXT | Описание задачи (опционально) |
| completed | BOOLEAN DEFAULT FALSE | Статус выполнения |
| created_at | TIMESTAMP DEFAULT NOW() | Дата создания |
| updated_at | TIMESTAMP DEFAULT NOW() | Дата последнего обновления |

### Подключение к базе данных

```bash
# Подключение к PostgreSQL контейнеру
docker exec -it todo_database psql -U postgres -d todoapp
```

## 🔧 Переменные окружения

### Backend (.env)
```env
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://postgres:postgres@db:5432/todos
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

## 🧪 Тестирование

### API тестирование
```bash
# Health check
curl http://localhost:3000/health

# Получить все задачи
curl http://localhost:3000/api/todos
```

## 📚 Технологические решения

### Frontend
- **React 18** - Последняя версия с Concurrent Features
- **TypeScript** - Строгая типизация
- **Vite** - Быстрый сборщик с HMR
- **Axios** - HTTP клиент для API запросов

### Backend
- **Express.js** - Минималистичный веб-фреймворк
- **TypeScript** - Типизированный JavaScript
- **pg** - PostgreSQL драйвер для Node.js
- **CORS** - Поддержка кросс-доменных запросов

### Database
- **PostgreSQL 15** - Реляционная база данных
- **Alpine Linux** - Легковесный образ
- **Автоматические триггеры** - Для updated_at

## 🩺 Диагностика

### Network Error - Проблемы подключения

Если фронтенд показывает "Network Error" при попытке загрузить задачи:

1. **Проверить health check API**
   ```bash
   curl http://localhost:3000/health
   ```
   Должен вернуть: `{"ok": true}` со статусом 200

2. **Проверить переменную окружения**
   Убедитесь, что `VITE_API_URL` указывает на правильный адрес:
   ```bash
   # В frontend/.env
   VITE_API_URL=http://localhost:3000
   ```

3. **Проверить запущенные сервисы**
   ```bash
   docker compose ps
   ```
   Все сервисы должны быть в статусе "Up"

4. **Проверить логи**
   ```bash
   # Логи API сервиса
   docker compose logs api
   
   # Логи всех сервисов
   docker compose logs -f
   ```

## ⚠️ Типичные ошибки

### 1. Network Error на фронтенде

**Причины:**
- ❌ API сервер не запущен
- ❌ Неверный `VITE_API_URL`
- ❌ CORS проблемы
- ❌ Неправильные пути в docker-compose.yml
- ❌ **Использование Live Server вместо Vite**

**Решения:**
```bash
# Проверить API
curl http://localhost:3000/health

# Проверить переменные окружения
echo $VITE_API_URL

# Проверить статус контейнеров
docker compose ps
```

### 2. CORS ошибки

**Симптомы:** `Access to fetch at ... has been blocked by CORS policy`

**Решение:** Убедитесь что в `backend/src/index.ts`:
```typescript
app.use(cors({ origin: "*" }));
```

### 3. Неправильные пути в Docker Compose

**Проверить:**
- `context: ./backend` (папка backend существует)
- `context: ./frontend` (папка frontend существует)
- Dockerfile в соответствующих папках

### 4. База данных недоступна

**Симптомы:** `Can't reach database server`

**Решения:**
```bash
# Для Docker
docker compose up db

# Для локальной разработки
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todos?schema=public
```

### 5. Использование Live Server (VSCode)

**❌ ОШИБКА:** Запуск через Live Server на порту 5500

**Проблемы:**
- Отсутствует Vite конфигурация
- Нет прокси для `/api` запросов  
- Не читаются environment variables
- CORS ошибки

**✅ РЕШЕНИЕ:** Использовать Vite dev-сервер:
```bash
cd frontend
npm run dev
# Открыть: http://localhost:5173 (НЕ 5500!)
```

## 🔍 Устранение неполадок

### Общие проблемы

1. **Порты заняты**
   ```bash
   # Проверить занятые порты
   lsof -i :3000
   lsof -i :5173
   lsof -i :5432
   ```

2. **База данных не подключается**
   ```bash
   # Проверить статус контейнеров
   docker-compose ps
   
   # Посмотреть логи базы данных
   docker-compose logs database
   ```

3. **Frontend не может подключиться к API**
   - Проверить переменную `VITE_API_URL` в `.env`
   - Убедиться что backend запущен на порту 3001

### Очистка Docker

```bash
# Удалить все остановленные контейнеры
docker container prune

# Удалить неиспользуемые образы
docker image prune

# Полная очистка
docker system prune -a
```

## 🚀 Production развертывание

### Готовность к production
- ✅ Docker контейнеризация
- ✅ Environment variables
- ✅ Health checks
- ✅ Proper error handling
- ✅ TypeScript для type safety

### Рекомендации для production
1. Использовать внешний PostgreSQL
2. Добавить HTTPS/TLS
3. Настроить мониторинг (Prometheus/Grafana)
4. Добавить rate limiting
5. Настроить логирование (Winston/Pino)
6. Добавить тесты (Jest/Cypress)

## 🤝 Участие в разработке

1. Fork проекта
2. Создать feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменений (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Создать Pull Request

## 📄 Лицензия

Этот проект распространяется под лицензией MIT.

## 🙏 Благодарности

- React team за отличный фреймворк
- Express.js за простой и мощный веб-сервер
- PostgreSQL team за надежную базу данных
- Docker за упрощение развертывания