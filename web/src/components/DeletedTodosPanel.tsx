import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { todoApi } from '../api';
import { Todo } from '../types';
import { useRestoreTodo } from '../hooks';
import { useCleanupDeletedTodos } from '../hooks';
import { useTranslation } from 'react-i18next';

export default function DeletedTodosPanel() {
  const { t } = useTranslation();
  const { data: all = [], isLoading } = useQuery({ queryKey: ['todos', 'deleted'], queryFn: () => (todoApi as any).getAllWithDeleted ? (todoApi as any).getAllWithDeleted() : fetch('/api/todos?includeDeleted=true').then(r => r.json()) });
  const restore = useRestoreTodo();

  const deleted = all.filter((d: Todo) => !!d.deletedAt);
  const cleanup = useCleanupDeletedTodos();

  if (isLoading) return <div className="card">{t('loading')}</div>;
  if (deleted.length === 0) return null;

  return (
    <div className="card deleted-panel">
      <h3>{t('deletedTasks')}</h3>
      <div className="deleted-panel-actions">
        <button
          className="button danger compact"
          onClick={() => {
            if (!confirm(t('confirmCleanup') || 'Очистить все удалённые задачи?')) return;
            cleanup.mutate();
          }}
          disabled={(cleanup as any).isLoading ?? ((cleanup as any).status === 'loading')}
        >
          {t('cleanupDeleted')}
        </button>
      </div>
      <div className="deleted-list">
        {deleted.map((d: Todo) => (
          <div key={d.id} className="deleted-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{d.title}</div>
              {d.description ? <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{d.description}</div> : null}
            </div>
            <div>
              <button className="button compact" onClick={() => restore.mutate(d.id)}>{t('restore')}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
