import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  ru: { translation: {
    appTitle: "Список задач",
    apiOk: "API: OK",
    apiFail: "API: Ошибка",
  loading: "Загрузка...",
    newTask: "Новая задача…",
    description: "Описание (необязательно)",
    add: "Добавить",
    all: "Все",
    pending: "В ожидании",
    done: "Выполненные",
    search: "Поиск…",
    noTasks: "Задач нет",
    nothingFound: "По фильтрам ничего не найдено",
    delete: "Удалить",
    confirmDelete: "Вы уверены, что хотите удалить эту задачу?",
    // Настройки
    settings: "Настройки",
    language: "Язык",
    theme: "Тема",
    light: "Светлая",
    dark: "Темная",
    system: "Системная",
    confirmDeleteSetting: "Подтверждать удаление задач",
    defaultSort: "Сортировка по умолчанию",
    sortByDate: "По дате создания",
    sortByTitle: "По названию",
    sortByPriority: "По приоритету",
    // Календарь
    calendar: "Календарь",
    list: "Список",
    // Проекты и секции
    projects: "Проекты",
  deletedTasks: "Удалённые задачи",
  restore: "Восстановить",
  cleanupDeleted: "Очистить удалённые",
  cleanupArchived: "Очистить архив",
  confirmCleanup: "Вы уверены, что хотите окончательно удалить все удалённые задачи?",
  cleanupArchivedPlaceholder: "Очистка архива не реализована",
    createProject: "Создать проект",
    closeSidebar: "Закрыть боковую панель",
    createSection: "Создать секцию",
    archiveProject: "Архивировать проект",
    archivedProjects: "Архивированные",
    unarchiveProject: "Разархивировать проект",
    projectName: "Название проекта",
    sectionName: "Название секции",
    confirmArchive: "Архивировать этот проект?",
    toggleSidebar: "Переключить боковую панель"
      ,
      home: "На главную"
  }},
  en: { translation: {
    appTitle: "Todo App",
    apiOk: "API: OK",
    apiFail: "API: FAIL",
  loading: "Loading...",
    newTask: "New task…",
    description: "Description (optional)",
    add: "Add",
    all: "All",
    pending: "Pending",
    done: "Done",
    search: "Search…",
    noTasks: "No tasks",
    nothingFound: "Nothing found",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this task?",
    // Settings
    settings: "Settings",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    confirmDeleteSetting: "Confirm task deletion",
    defaultSort: "Default sorting",
    sortByDate: "By creation date",
    sortByTitle: "By title",
    sortByPriority: "By priority",
    // Calendar
    calendar: "Calendar",
    list: "List",
    // Projects and sections
    projects: "Projects",
  deletedTasks: "Deleted tasks",
  restore: "Restore",
  cleanupDeleted: "Cleanup deleted",
  cleanupArchived: "Cleanup archived",
  confirmCleanup: "Are you sure you want to permanently delete all deleted tasks?",
    createProject: "Create Project",
    closeSidebar: "Close Sidebar",
    createSection: "Create Section",
    archiveProject: "Archive Project",
    archivedProjects: "Archived",
    unarchiveProject: "Unarchive Project",
    projectName: "Project name",
    sectionName: "Section name",
    confirmArchive: "Archive this project?",
    toggleSidebar: "Toggle Sidebar"
      ,
      home: "Home"
  }},
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("lang") || "ru",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: {
    useSuspense: true, // Включаем Suspense для react-i18next
  },
});

console.log('i18n.ts: i18n initialized with language:', i18n.language);

export default i18n;