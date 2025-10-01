import axios from 'axios';
import { Todo, CreateTodoRequest, UpdateTodoRequest, Project, Section, CreateProjectRequest, UpdateProjectRequest, CreateSectionRequest, UpdateSectionRequest } from "./types";

// normalizer: tolerate either boolean `archived` or timestamp `archivedAt`
function coerceArchived(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'true' || s === '1' || s === 'yes' || s === 'on') return true;
    if (s === 'false' || s === '0' || s === 'no' || s === 'off') return false;
    // неизвестные строки трактуем безопасно как false
    return false;
  }
  if (typeof v === 'number') return v === 1; // 0/1
  return false; // null/undefined/прочее — считаем не архив
}

export function normalizeProject(p: any): Project {
  return {
    id: Number(p.id),
    name: String(p.name ?? ''),
    description: p.description ?? null,
    archived: coerceArchived(p.archived), // canonical boolean
    archivedAt: p.archivedAt ?? null,
    createdAt: p.createdAt ?? null,
    updatedAt: p.updatedAt ?? null,
  } as Project;
}

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000
});

// Автоматическая нормализация всех ответов с проектами
api.interceptors.response.use((resp) => {
  const url = resp.config?.url || '';
  if (url.startsWith('/projects') || url.startsWith('projects')) {
    const d = resp.data;
    if (Array.isArray(d))       resp.data = d.map(normalizeProject);
    else if (d && typeof d==='object') resp.data = normalizeProject(d);
  }
  return resp;
});

// Отслеживание вызовов архивирования
api.interceptors.request.use((cfg) => {
  const u = cfg.url || '';
  if (/\/projects\/\d+\/archive\b/.test(u)) {
    console.warn('⚠️ Архивирование вызвано запросом:', u, cfg.method, cfg.data);
    console.trace(); // стек – кто сделал вызов
  }
  return cfg;
});

// Todo API functions
export const todoApi = {
  getAll: () => api.get<Todo[]>('/todos').then(res => res.data),
  getAllWithDeleted: () => api.get<Todo[]>('/todos?includeDeleted=true').then(res => res.data),
  getById: (id: number) => api.get<Todo>(`/todos/${id}`).then(res => res.data),
  create: (data: CreateTodoRequest) => api.post<Todo>('/todos', data).then(res => res.data),
  update: (id: number, data: UpdateTodoRequest) => api.put<Todo>(`/todos/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/todos/${id}`).then(res => res.data),
  restore: (id: number) => api.post<Todo>(`/todos/${id}/restore`, {}).then(res => res.data),
  cleanup: () => api.post<{ deleted: number }>('/todos/cleanup').then(res => res.data),
};

// Project API functions
// includeArchived: if true, pass ?includeArchived=true to server so it returns archived projects too
export const projectApi = {
  getAll: async (includeArchived: boolean = false) => {
    // ЗАЩИТА: При обновлении страницы не должно передаваться includeArchived=true случайно
    if (includeArchived) {
      console.warn('⚠️ ВНИМАНИЕ: getAll вызван с includeArchived=true! Убедитесь, что это намеренно');
    }
    
    const q = includeArchived ? '?includeArchived=true' : '';
    console.log(`[projectApi.getAll] includeArchived=${includeArchived}, URL=/api/projects${q}`);
    const { data } = await api.get<Project[]>(`/projects${q}`);
    const normalized = Array.isArray(data) ? data.map(normalizeProject) : [];
    console.log(`[projectApi.getAll] Получено ${normalized.length} проектов:`, normalized.map(p => ({ id: p.id, name: p.name, archived: p.archived })));
    return normalized;
  },
  
  // НОВЫЙ метод: получить ТОЛЬКО активные проекты
  getActive: async () => {
    console.log(`[projectApi.getActive] Запрос только активных проектов`);
    const { data } = await api.get<Project[]>('/projects');
    const list = (Array.isArray(data) ? data : []).map(normalizeProject); // ← нормализация ОБЯЗАТЕЛЬНА
    const activeOnly = list.filter(p => !p.archived); // ← фильтр по boolean после нормализации
    console.log(`[projectApi.getActive] Получено ${activeOnly.length} активных проектов:`, activeOnly.map(p => ({ id: p.id, name: p.name, archived: p.archived })));
    return activeOnly;
  },
  
  // НОВЫЙ метод: получить ТОЛЬКО архивированные проекты  
  getArchived: async () => {
    console.log(`[projectApi.getArchived] Запрос только архивированных проектов`);
    const { data } = await api.get<Project[]>('/projects?includeArchived=true');
    const list = (Array.isArray(data) ? data : []).map(normalizeProject); // ← нормализация ОБЯЗАТЕЛЬНА
    const archivedOnly = list.filter(p => p.archived); // ← фильтр по boolean после нормализации
    console.log(`[projectApi.getArchived] Получено ${archivedOnly.length} архивированных проектов:`, archivedOnly.map(p => ({ id: p.id, name: p.name, archived: p.archived })));
    return archivedOnly;
  },
  getById: async (id: number) => {
    const { data } = await api.get(`/projects/${id}`);
    return normalizeProject(data);
  },
  create: async (data: CreateProjectRequest) => {
    const { data: created } = await api.post('/projects', data);
    return normalizeProject(created);
  },
  update: async (id: number, data: UpdateProjectRequest) => {
    const { data: updated } = await api.put(`/projects/${id}`, data);
    return normalizeProject(updated);
  },
  delete: (id: number) => api.delete(`/projects/${id}`),
  archive: async (id: number) => {
    const { data: archived } = await api.post(`/projects/${id}/archive`, {});
    return normalizeProject(archived);
  },
  unarchive: async (id: number) => {
    const { data: unarchived } = await api.post(`/projects/${id}/unarchive`, {});
    return normalizeProject(unarchived);
  },
  cleanupArchived: () => api.post<{ deleted: number }>(`/projects/cleanup/archived`, {}).then(res => res.data),
};

// Section API functions
export const sectionApi = {
  getAll: () => api.get<Section[]>('/sections').then(res => res.data),
  getById: (id: number) => api.get<Section>(`/sections/${id}`).then(res => res.data),
  create: (data: CreateSectionRequest) => api.post<Section>('/sections', data).then(res => res.data),
  update: (id: number, data: UpdateSectionRequest) => api.put<Section>(`/sections/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/sections/${id}`),
};