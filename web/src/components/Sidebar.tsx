import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Project, Section } from '../types';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  projects: Project[];
  selectedProjectId?: number;
  selectedSectionId?: number;
  onProjectSelect: (projectId: number) => void;
  onSectionSelect: (sectionId: number) => void;
  onCreateProject: () => void;
  onCreateSection: (projectId: number) => void;
  onArchiveProject: (projectId: number) => void;
  onUnarchiveProject: (projectId: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  projects,
  selectedProjectId,
  selectedSectionId,
  onProjectSelect,
  onSectionSelect,
  onCreateProject,
  onCreateSection,
  onArchiveProject,
  onUnarchiveProject,
  isOpen,
  onClose,
}: SidebarProps) {
  const { t } = useTranslation();
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());

  const toggleProjectExpanded = (projectId: number) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  // ВАЖНО: projects должен содержать ТОЛЬКО активные проекты из useProjects()
  const activeProjects = projects.filter(p => !p.archived);
  const archivedProjects = projects.filter(p => p.archived);

  // Временное логирование для отладки
  console.log('[Sidebar] Входящие проекты:', projects.map(p => ({ id: p.id, name: p.name, archived: p.archived })));
  console.log('[Sidebar] Активные после фильтрации:', activeProjects.map(p => ({ id: p.id, name: p.name, archived: p.archived })));
  console.log('[Sidebar] Архивированные после фильтрации (должно быть пусто!):', archivedProjects.map(p => ({ id: p.id, name: p.name, archived: p.archived })));

  // ПРОВЕРКА: если в входящих данных есть архивированные проекты - это баг!
  if (archivedProjects.length > 0) {
    console.groupCollapsed('🚨 Sidebar получил архивные проекты (не должно)');
    console.table(projects.map(p => ({
      id: p.id, name: p.name, archived: (p as any).archived, type: typeof (p as any).archived
    })));
    console.trace(); // покажет стек – откуда пришли props
    console.groupEnd();
  }

  return (
    <>
      {/* Overlay для мобильных устройств */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={onClose}
        />
      )}
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">{t('projects')}</h2>
          <div className="sidebar-actions">
            <button
              className="button compact"
              onClick={onCreateProject}
              title={t('createProject')}
            >
              +
            </button>
            <button
              className="button icon close-button"
              onClick={onClose}
              title={t('closeSidebar')}
            >
              ✕
            </button>
          </div>
        </div>

      <div className="sidebar-content">
        <div className="quick-actions" style={{ marginBottom: '12px' }}>
          <NavLink to="/deleted" className="quick-action" onClick={() => { if (window.innerWidth <= 768) onClose(); }}>{t('deletedTasks')}</NavLink>
          <NavLink to="/archived" className="quick-action" onClick={() => { if (window.innerWidth <= 768) onClose(); }}>{t('archivedProjects')}</NavLink>
        </div>
        {/* Active Projects */}
        {activeProjects.map(project => (
          <div key={project.id} className="project-group">
            <div
              className={`project-header ${selectedProjectId === project.id ? 'selected' : ''}`}
              onClick={() => {
                onProjectSelect(project.id);
                toggleProjectExpanded(project.id);
                // Закрываем sidebar на мобильных устройствах
                if (window.innerWidth <= 768) {
                  onClose();
                }
              }}
            >
              <div className="project-info">
                <div className="project-color" style={{ backgroundColor: project.color || '#3b82f6' }} />
                <span className="project-name">{project.name}</span>
                <span className="project-count">({project._count?.sections || 0})</span>
              </div>
              <div className="project-actions">
                {/* Build actions list and dedupe by key to avoid duplicates */}
                {(() => {
                  type Action = { key: 'archive' | 'delete' | 'edit' | 'section'; icon: React.ReactNode; onClick: () => void };

                  const rawActions: Action[] = [
                    { key: 'section', icon: '+', onClick: () => onCreateSection(project.id) },
                    { key: 'archive', icon: '📁', onClick: () => onArchiveProject(project.id) },
                    // duplicate removed
                  ];

                  const actions = Array.from(new Map(rawActions.map(a => [a.key, a])).values());

                  return actions.map(a => (
                    <button
                      key={a.key}
                      className="button icon"
                      onClick={(e) => { e.stopPropagation(); a.onClick(); }}
                      title={a.key === 'section' ? t('createSection') : (a.key === 'archive' ? t('archiveProject') : undefined)}
                    >
                      {a.icon}
                    </button>
                  ));
                })()}
              </div>
            </div>

            {expandedProjects.has(project.id) && project.sections && (
              <div className="sections-list">
                {project.sections.map(section => (
                  <div
                    key={section.id}
                    className={`section-item ${selectedSectionId === section.id ? 'selected' : ''}`}
                    onClick={() => {
                      onSectionSelect(section.id);
                      // Закрываем sidebar на мобильных устройствах
                      if (window.innerWidth <= 768) {
                        onClose();
                      }
                    }}
                  >
                    <span className="section-name">{section.name}</span>
                    <span className="section-count">({section._count?.todos || 0})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Archived Projects */}
        {archivedProjects.length > 0 && (
          <div className="archived-section">
            <h3 className="archived-title">{t('archivedProjects')}</h3>
            {archivedProjects.map(project => (
              <div
                key={project.id}
                className={`project-header archived ${selectedProjectId === project.id ? 'selected' : ''}`}
                onClick={() => {
                  onProjectSelect(project.id);
                  // Закрываем sidebar на мобильных устройствах
                  if (window.innerWidth <= 768) {
                    onClose();
                  }
                }}
              >
                <div className="project-info">
                  <div className="project-color archived" style={{ backgroundColor: project.color || '#6b7280' }} />
                  <span className="project-name">{project.name}</span>
                </div>
                <button
                  className="button icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnarchiveProject(project.id);
                  }}
                  title={t('unarchiveProject')}
                >
                  📂
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}