import React, { useState } from 'react';
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo } from './hooks';
import { Todo, CreateTodoRequest, completedToStatus } from './types';
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';
import TodoFilters, { ViewMode } from './components/TodoFilters';

const App: React.FC = () => {
  const [filters, setFilters] = useState<{
    status?: "PENDING" | "DONE";
    search?: string;
  }>({});
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Используем хуки из hooks.ts
  const { data: todos = [], isLoading, error } = useTodos();
  const createTodoMutation = useCreateTodo();
  const updateTodoMutation = useUpdateTodo();
  const deleteTodoMutation = useDeleteTodo();

  const handleCreateTodo = (todoData: { title: string; description?: string }) => {
    const requestData: CreateTodoRequest = {
      title: todoData.title,
      description: todoData.description,
      priority: 'MEDIUM' // Дефолтный приоритет
    };
    createTodoMutation.mutate(requestData);
  };

  const handleDeleteTodo = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      deleteTodoMutation.mutate(id);
    }
  };

  const handleToggleTodo = (todo: Todo) => {
    // Переключаем completed статус
    const newCompleted = !todo.completed;
    updateTodoMutation.mutate({
      id: todo.id,
      data: { completed: newCompleted }
    });
  };

  // Фильтрация задач с учетом Status и поиска
  const filteredTodos = todos.filter(todo => {
    const todoStatus = completedToStatus(todo.completed);
    
    // Фильтр по статусу
    if (filters.status && todoStatus !== filters.status) {
      return false;
    }
    
    // Фильтр по поиску
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = todo.title.toLowerCase().includes(searchLower);
      const descriptionMatch = todo.description?.toLowerCase().includes(searchLower);
      if (!titleMatch && !descriptionMatch) {
        return false;
      }
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        color: 'red'
      }}>
        <div>Ошибка: {(error as Error).message}</div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>📝 Todo App</h1>
      
      {/* Форма создания задачи */}
      <TodoForm onSubmit={handleCreateTodo} pending={createTodoMutation.isPending} />

      {/* Фильтры */}
      <TodoFilters value={filters} onChange={setFilters} viewMode={viewMode} onViewModeChange={setViewMode} />

      {/* Список задач */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filteredTodos.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#6c757d',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            {!filters.status && !filters.search ? 'Задач нет' : 'Задач не найдено по фильтрам'}
          </div>
        ) : (
          filteredTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={() => handleToggleTodo(todo)}
              onDelete={() => handleDeleteTodo(todo.id)}
            />
          ))
        )}
      </ul>
    </div>
  );
};

export default App;