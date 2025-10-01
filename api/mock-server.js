const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Фиктивные данные
let todos = [
  {
    id: 1,
    title: "Изучить React",
    description: "Разобраться с хуками и контекстом",
    completed: false,
    status: "PENDING",
    priority: "HIGH",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Изучить Express",
    description: "Создать простой REST API",
    completed: true,
    status: "DONE",
    priority: "MEDIUM",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "Завершить проект",
    description: "Подготовить финальную версию",
    completed: false,
    status: "PENDING",
    priority: "URGENT",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Маршруты API
app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

// Получить все задачи
app.get('/api/todos', (req, res) => {
  const { status, search } = req.query;
  let filteredTodos = [...todos];
  
  if (status) {
    filteredTodos = filteredTodos.filter(todo => todo.status === status);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredTodos = filteredTodos.filter(todo => 
      todo.title.toLowerCase().includes(searchLower) || 
      (todo.description && todo.description.toLowerCase().includes(searchLower))
    );
  }
  
  res.json(filteredTodos);
});

// Получить задачу по ID
app.get('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  
  if (!todo) {
    return res.status(404).json({ message: "Not found" });
  }
  
  res.json(todo);
});

// Создать новую задачу
app.post('/api/todos', (req, res) => {
  const { title, description, status, priority, completed } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: "Title is required" });
  }
  
  const newTodo = {
    id: todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1,
    title,
    description: description || null,
    status: status || "PENDING",
    priority: priority || "MEDIUM",
    completed: completed || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// Обновить задачу
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, status, priority, completed } = req.body;
  
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Not found" });
  }
  
  // Обновляем задачу
  const updatedTodo = {
    ...todos[index],
    title: title !== undefined ? title : todos[index].title,
    description: description !== undefined ? description : todos[index].description,
    status: status !== undefined ? status : todos[index].status,
    priority: priority !== undefined ? priority : todos[index].priority,
    completed: completed !== undefined ? completed : todos[index].completed,
    updatedAt: new Date().toISOString()
  };
  
  todos[index] = updatedTodo;
  res.json(updatedTodo);
});

// Удалить задачу
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: "Not found" });
  }
  
  todos.splice(index, 1);
  res.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Mock API server running at http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/todos`);
  console.log(`Health check at http://localhost:${PORT}/health`);
});