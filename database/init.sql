-- Создание базы данных (если не существует)
SELECT 'CREATE DATABASE todoapp'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'todoapp')\gexec

-- Подключение к базе данных
\c todoapp;

-- Ensure enums exist
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority') THEN
       CREATE TYPE priority AS ENUM ('LOW','MEDIUM','HIGH','URGENT');
   END IF;
   IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status') THEN
       CREATE TYPE status AS ENUM ('PENDING','DONE');
   END IF;
END$$;

-- Создание таблицы projects и sections если не существуют
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE
);

-- Создание таблицы todos (idempotent) и добавление недостающих колонок
CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns if they don't exist
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='todos' AND column_name='status') THEN
       ALTER TABLE todos ADD COLUMN status status DEFAULT 'PENDING';
   END IF;
   IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='todos' AND column_name='priority') THEN
       ALTER TABLE todos ADD COLUMN priority priority DEFAULT 'MEDIUM';
   END IF;
   IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='todos' AND column_name='due_date') THEN
       ALTER TABLE todos ADD COLUMN due_date TIMESTAMP;
   END IF;
   IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='todos' AND column_name='section_id') THEN
       ALTER TABLE todos ADD COLUMN section_id INT;
       ALTER TABLE todos ADD CONSTRAINT todos_section_id_fkey FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET NULL;
   END IF;
   IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='todos' AND column_name='deleted_at') THEN
       ALTER TABLE todos ADD COLUMN deleted_at TIMESTAMP;
   END IF;
END$$;

-- Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создание триггера для автоматического обновления updated_at
CREATE TRIGGER update_todos_updated_at 
    BEFORE UPDATE ON todos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Вставка тестовых данных
-- Insert sample todos only if table is empty
DO $$
BEGIN
   IF (SELECT COUNT(*) FROM todos) = 0 THEN
       INSERT INTO todos (title, description, completed) VALUES
       ('Изучить TypeScript', 'Пройти курс по TypeScript для фронтенд разработки', false),
       ('Настроить Docker', 'Изучить основы Docker и Docker Compose', false),
       ('Создать API', 'Разработать REST API для Todo приложения', true),
       ('Написать тесты', 'Покрыть код unit и integration тестами', false);
   END IF;
END$$;

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);