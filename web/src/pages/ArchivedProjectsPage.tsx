import React from 'react';
import { useArchivedProjects, useUnarchiveProject, useCleanupArchivedProjects } from '../hooks';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function ArchivedProjectsPage() {
  const { t } = useTranslation();
  const { data: archived = [], isLoading } = useArchivedProjects();
  const unarchive = useUnarchiveProject();
  const cleanup = useCleanupArchivedProjects();
  const navigate = useNavigate();

  return (
    <main className="container mx-auto p-4">
  <div style={{ marginTop: '-40px' }}>
    <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => navigate('/')} className="button btn-outline home">← {t('home')}</button>
        <button
          onClick={() => {
            if (confirm(t('confirmCleanup') || 'Очистить архив?')) {
              cleanup.mutate();
            }
          }}
          className="button btn-outline"
          disabled={(cleanup as any).isLoading ?? ((cleanup as any).status === 'loading')}
        >
          {t('cleanupArchived') || 'Очистить архив'}
        </button>
      </div>

      <div className="card">
        {isLoading ? (
          <div>{t('loading')}</div>
        ) : (
          <div style={{ marginTop: '1rem', display: 'grid', gap: '12px' }}>
            {archived.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--muted)' }}>{t('noTasks')}</div>
            ) : (
              archived.map((p: any) => (
                <div key={p.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div>
                    <button className="button compact" onClick={() => unarchive.mutate(p.id)}>{t('unarchiveProject')}</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  </main>
  );
}
