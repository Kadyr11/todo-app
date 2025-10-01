import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo, useProjects, useCreateProject, useCreateSection, useArchiveProject, useUnarchiveProject } from './hooks';
import { Todo, CreateTodoRequest, completedToStatus, Project } from './types';
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';
import TodoFilters, { ViewMode } from './components/TodoFilters';
// DeletedTodosPanel moved to dedicated page
import CalendarView from './components/CalendarView';
import SettingsPanel from './components/SettingsPanel';
import Sidebar from './components/Sidebar';
import ApiStatusBar from './components/ApiStatusBar';
import Layout from './components/Layout';
import axios from 'axios';
import { useTranslation } from "react-i18next";
import { useSettings } from './contexts/SettingsContext';
import i18n from './i18n';

const App: React.FC = () => {
  const { t } = useTranslation();
  // no location-based header; keep header static
  const [filters, setFilters] = useState<{
    status?: "PENDING" | "DONE";
    search?: string;
  }>({});
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>();
  const [selectedSectionId, setSelectedSectionId] = useState<number | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  
  // Панель настроек
  const [showSettingsPanel, setShowSettingsPanel] = useState<boolean>(false);
  
  // Временная проверка API подключения
  const [apiOk, setApiOk] = useState<boolean | null>(null);
  
  // Форсируем перерендеринг при изменении языка
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const handleLanguageChange = () => forceUpdate({});
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);
  
  useEffect(() => {
    // Используем относительный путь, который будет проксирован
    axios.get('/health')
      .then(() => setApiOk(true))
      .catch(() => setApiOk(false));
  }, []);

  const { data: todos = [], isLoading, error } = useTodos();
  const { data: projects = [] } = useProjects();
  const createTodoMutation = useCreateTodo();
  const updateTodoMutation = useUpdateTodo();
  const deleteTodoMutation = useDeleteTodo();
  const createProjectMutation = useCreateProject();
  const createSectionMutation = useCreateSection();
  const archiveProjectMutation = useArchiveProject();
  const unarchiveProjectMutation = useUnarchiveProject();

  const handleCreateTodo = (todoData: { title: string; description?: string }) => {
    const requestData: CreateTodoRequest = {
      title: todoData.title,
      description: todoData.description,
      priority: 'MEDIUM', // Дефолтный приоритет
      sectionId: selectedSectionId,
    };
    createTodoMutation.mutate(requestData);
  };

  const { settings } = useSettings();
  const location = useLocation();

  // Determine header title based on current route
  let headerTitleKey = 'appTitle';
  if (location.pathname.startsWith('/deleted')) headerTitleKey = 'deletedTasks';
  else if (location.pathname.startsWith('/archived')) headerTitleKey = 'archivedProjects';
  
  const handleDeleteTodo = (id: number) => {
    if (!settings.confirmDelete || window.confirm(t("confirmDelete"))) {
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

  // Фильтрация задач с учетом Status, поиска, проекта и секции
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
    
    // Фильтр по выбранному проекту/секции
    if (selectedSectionId) {
      if (todo.sectionId !== selectedSectionId) {
        return false;
      }
    } else if (selectedProjectId) {
      // Если выбран проект, но не секция, показываем все todos проекта
      const projectSections = projects.find(p => p.id === selectedProjectId)?.sections || [];
      const projectSectionIds = projectSections.map(s => s.id);
      if (todo.sectionId && !projectSectionIds.includes(todo.sectionId)) {
        return false;
      }
      // Также показываем todos без секции, если они принадлежат проекту (пока не реализовано)
    }
    
    return true;
  }).sort((a, b) => {
    // Сортировка согласно настройкам
    switch (settings.defaultSort) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'priority':
        const priorityOrder = { LOW: 1, MEDIUM: 2, HIGH: 3 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'createdAt':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Обработчики для sidebar
  const handleProjectSelect = (projectId: number) => {
    setSelectedProjectId(projectId);
    setSelectedSectionId(undefined); // Сбрасываем выбранную секцию
  };

  const handleSectionSelect = (sectionId: number) => {
    setSelectedSectionId(sectionId);
    // Находим проект для выбранной секции
    const section = projects.flatMap(p => p.sections || []).find(s => s.id === sectionId);
    if (section) {
      setSelectedProjectId(section.projectId);
    }
  };

  const handleCreateProject = () => {
    const name = prompt(t('projectName'));
    if (name) {
      createProjectMutation.mutate({ name });
    }
  };


  const handleCreateSection = (projectId: number) => {
    const name = prompt(t('sectionName'));
    if (name) {
      createSectionMutation.mutate({ name, projectId });
    }
  };

  const handleArchiveProject = (projectId: number) => {
    if (confirm(t('confirmArchive'))) {
      archiveProjectMutation.mutate(projectId);
    }
  };

  const handleUnarchiveProject = (projectId: number) => {
    unarchiveProjectMutation.mutate(projectId);
  };

  if (isLoading) {
    return (
      <div className="app" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center'
      }}>
        <div>Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        color: 'var(--danger-border)'
      }}>
        <div>Ошибка: {(error as Error).message}</div>
      </div>
    );
  }

  const DeletedPage = lazy(() => import('./pages/DeletedTodosPage'));
  const ArchivedPage = lazy(() => import('./pages/ArchivedProjectsPage'));

  const Home = () => (
    <div style={{ marginTop: '-40px' }}>
      <ApiStatusBar apiOk={apiOk} />
      <TodoForm onSubmit={handleCreateTodo} pending={createTodoMutation.isPending} />
      <TodoFilters
        value={filters}
        onChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Список задач или календарь */}
      {viewMode === 'calendar' ? (
        <CalendarView
          todos={filteredTodos}
          onTodoClick={(todo) => {
            console.log('Задача нажата:', todo);
          }}
        />
      ) : (
        <>
          {filteredTodos.length === 0 ? (
            <div className="card" style={{ 
              textAlign: 'center', 
              padding: 'var(--space-3)',
              color: 'var(--muted)',
              margin: 'var(--space-2) 0'
            }}>
              {!filters.status && !filters.search ? t("noTasks") : t("nothingFound")}
            </div>
          ) : (
            <div className="todos">
              {filteredTodos.map(todo => (
                <TodoItem key={todo.id} todo={todo} onToggle={() => handleToggleTodo(todo)} onDelete={() => handleDeleteTodo(todo.id)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="app">
      <Sidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        selectedSectionId={selectedSectionId}
        onProjectSelect={handleProjectSelect}
        onSectionSelect={handleSectionSelect}
        onCreateProject={handleCreateProject}
        onCreateSection={handleCreateSection}
        onArchiveProject={handleArchiveProject}
        onUnarchiveProject={handleUnarchiveProject}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main-content">
        <header className="header">
          <button
            className="icon-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={t('toggleSidebar')}
            aria-label={t('toggleSidebar')}
          >
            <span className="burger" aria-hidden="true" />
          </button>

          <h1 className="header-title">{t(headerTitleKey)}</h1>


          <button
            className="icon-btn settings-btn"
            onClick={() => setShowSettingsPanel(true)}
            title={t('settings')}
            aria-label={t('settings')}
          >
            <span className="glyph">⚙️</span>
          </button>
        </header>

        <main style={{ padding: 'var(--space-3)' }}>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="deleted" element={<DeletedPage />} />
                <Route path="archived" element={<ArchivedPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      {showSettingsPanel && (
        <SettingsPanel
          onClose={() => setShowSettingsPanel(false)}
        />
      )}
    </div>
  );
};

export default App;