import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { todoApi, projectApi, sectionApi, normalizeProject } from './api';
import { CreateTodoRequest, UpdateTodoRequest, CreateProjectRequest, UpdateProjectRequest, CreateSectionRequest, UpdateSectionRequest } from './types';

// Todo hooks
export const useTodos = () => {
  return useQuery({
    queryKey: ['todos'],
    queryFn: todoApi.getAll,
  });
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: todoApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTodoRequest }) => todoApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: todoApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
  });
};

export const useRestoreTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => (todoApi as any).restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
  });
};

// Project hooks - ТОЛЬКО активные проекты
export const useProjects = () => {
  const result = useQuery({
    queryKey: ['projects', 'active'],
    queryFn: () => projectApi.getActive(), // Используем отдельный метод
  });
  
  // Временное логирование
  if (result.data) {
    console.log('[useProjects] Вернул активные проекты:', result.data.map(p => ({ id: p.id, name: p.name, archived: p.archived })));
  }
  
  return result;
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectApi.create,
    onSuccess: (data: any) => {
      const n = normalizeProject(data); // ← это поле у тебя отсутствовало в фрагменте
      // ТОЛЬКО обновляем кэш активных проектов
      queryClient.setQueryData(['projects', 'active'], (old: any[] = []) => {
        if (!old) return [n];
        return old.some((p: any) => p.id === n.id) ? old : [n, ...old];
      });
      // НЕ ТРОГАЕМ архивированные проекты вообще!
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProjectRequest }) => projectApi.update(id, data),
    onSuccess: () => {
      // Инвалидируем только активные проекты
      queryClient.invalidateQueries({ queryKey: ['projects', 'active'] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectApi.delete,
    onSuccess: () => {
      // Инвалидируем только активные проекты
      queryClient.invalidateQueries({ queryKey: ['projects', 'active'] });
    },
  });
};

export const useArchiveProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectApi.archive,
    onSuccess: () => {
      // При архивировании инвалидируем ОБА кэша
      queryClient.invalidateQueries({ queryKey: ['projects', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'archived'] });
    },
  });
};

// Section hooks
export const useSections = () => {
  return useQuery({
    queryKey: ['sections'],
    queryFn: sectionApi.getAll,
  });
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sectionApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'archived'] });
    },
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSectionRequest }) => sectionApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'archived'] });
    },
  });
};

export const useDeleteSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sectionApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'archived'] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

export const useCleanupDeletedTodos = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => (todoApi as any).cleanup(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    }
  });
};

// Hook to fetch deleted todos only
export const useDeletedTodos = () => {
  return useQuery({
    queryKey: ['todos', 'deleted'],
    queryFn: () => (todoApi as any).getAllWithDeleted().then((list: any[]) => list.filter(t => !!t.deletedAt)),
  });
};

// Hook to empty trash (permanent delete)
export const useEmptyTrash = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => (todoApi as any).cleanup(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todos', 'deleted'] });
    }
  });
};

// Archived projects hooks - ПОЛНОСТЬЮ изолированы
export const useArchivedProjects = () => {
  const result = useQuery({
    queryKey: ['projects', 'archived'],
    queryFn: () => projectApi.getArchived(), // Используем отдельный метод
  });
  
  if (result.data) {
    console.log('[useArchivedProjects] Финальный результат архивированных проектов:', result.data.map(p => ({ id: p.id, name: p.name, archived: p.archived })));
  }
  
  return result;
};

export const useUnarchiveProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectApi.unarchive(id),
    onSuccess: () => {
      // При разархивировании инвалидируем ОБА кэша  
      queryClient.invalidateQueries({ queryKey: ['projects', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'archived'] });
    },
  });
};

export const useCleanupArchivedProjects = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => projectApi.cleanupArchived(),
    onSuccess: () => {
      // Очистка архива затрагивает только архивированные проекты
      queryClient.invalidateQueries({ queryKey: ['projects', 'archived'] });
    },
  });
}

