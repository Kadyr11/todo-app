export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Добавляем Status тип для совместимости
export type Status = "PENDING" | "DONE";

export interface Todo {
  id: number;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: Priority;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  status?: Status; // Computed поле для совместимости
  sectionId?: number | null;
  section?: Section | null;
}

// Основной TodoDTO согласно вашему коду
export interface TodoDTO {
  title: string;
  description?: string;
  status?: Status;
  dueDate?: string; // ISO-string
}

// Утилитарные функции для конвертации
export const statusToCompleted = (status: Status): boolean => {
  return status === "DONE";
};

export const completedToStatus = (completed: boolean): Status => {
  return completed ? "DONE" : "PENDING";
};

// Расширенная версия TodoDTO для полной совместимости
export interface ExtendedTodoDTO extends TodoDTO {
  priority?: Priority; // Поддержка Priority для обратной совместимости
  completed?: boolean; // Для прямой совместимости с API
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string; // Поддержка dueDate из вашего кода
  sectionId?: number;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  dueDate?: string; // Поддержка dueDate из вашего кода
  status?: Status; // Альтернативный способ обновления через Status
}

export interface TodoFilters {
  completed?: boolean;
  priority?: Priority;
  search?: string;
  status?: Status; // Добавляем фильтрацию по Status
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface TodoResponse {
  data: Todo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
  byPriority: Record<Priority, number>;
  byStatus?: Record<Status, number>; // Дополнительная статистика по Status
}

// Project types
export interface Project {
  id: number;
  name: string;
  description?: string | null;
  color?: string | null;
  archived: boolean;             // canonical boolean flag
  archivedAt?: string | null;    // optional raw field from API (if present)
  createdAt?: string;
  updatedAt?: string;
  sections?: Section[];
  _count?: {
    sections: number;
  };
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  color?: string;
  archived?: boolean;
}

// Section types
export interface Section {
  id: number;
  name: string;
  description?: string | null;
  position: number;
  projectId: number;
  createdAt: string;
  updatedAt: string;
  project?: Project;
  todos?: Todo[];
  _count?: {
    todos: number;
  };
}

export interface CreateSectionRequest {
  name: string;
  description?: string;
  position?: number;
  projectId: number;
}

export interface UpdateSectionRequest {
  name?: string;
  description?: string;
  position?: number;
}