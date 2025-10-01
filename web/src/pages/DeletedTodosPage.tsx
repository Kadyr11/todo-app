import React from 'react';
import { useDeletedTodos, useRestoreTodo, useEmptyTrash } from '../hooks';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

export default function DeletedTodosPage() {
  const { t } = useTranslation();
  const { data: deleted = [], isLoading } = useDeletedTodos();
  const restore = useRestoreTodo();
  const emptyTrash = useEmptyTrash();
  const navigate = useNavigate();

  // Page doesn't manipulate layout header; the page H1 is shown below.

  return (
    <main className="container mx-auto p-4">
  <div style={{ marginTop: '-40px' }}>
    <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => navigate('/')} className="button btn-outline home">← {t('home')}</button>
        <button onClick={() => { if (confirm(t('confirmCleanup')||'Очистить все удалённые?')) emptyTrash.mutate(); }} className="button btn-outline">
          {t('cleanupDeleted')}
        </button>
      </div>

      <div className="card">
        {isLoading ? (<div>{t('loading')}</div>) : (
          <div style={{ marginTop: '1rem' }}>
            {deleted.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--muted)' }}>{t('noTasks')}</div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {deleted.map((d: any) => (
                  <div key={d.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{d.title}</div>
                      {d.description ? <div style={{ color: 'var(--muted)' }}>{d.description}</div> : null}
                    </div>
                    <div>
                      <button className="button compact" onClick={() => restore.mutate(d.id)}>{t('restore')}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
      </div>
      </main>
  );
}
