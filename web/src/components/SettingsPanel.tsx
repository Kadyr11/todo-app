import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const { settings, setSettings } = useSettings();
  const { t } = useTranslation();

  return (
    <div className="settings-panel" style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '400px',
      height: '100vh',
      background: 'var(--card)',
      borderLeft: '1px solid var(--border)',
      padding: '20px',
      boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      overflowY: 'auto',
      overflowX: 'hidden',
      wordWrap: 'break-word'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>{t('settings')}</h3>
        <button 
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: 'var(--muted)'
          }}
        >
          ✕
        </button>
      </div>
      
      {/* Язык */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{t('language')}</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={`button ${settings.lang === 'ru' ? 'primary' : ''}`}
            onClick={() => setSettings({ lang: 'ru' })}
          >
            🇷🇺 RU
          </button>
          <button 
            className={`button ${settings.lang === 'en' ? 'primary' : ''}`}
            onClick={() => setSettings({ lang: 'en' })}
          >
            🇺🇸 EN
          </button>
        </div>
      </div>

      {/* Тема */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{t('theme')}</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={`button ${settings.theme === 'light' ? 'primary' : ''}`}
            onClick={() => setSettings({ theme: 'light' })}
          >
            ☀️ {t('light')}
          </button>
          <button 
            className={`button ${settings.theme === 'dark' ? 'primary' : ''}`}
            onClick={() => setSettings({ theme: 'dark' })}
          >
            🌙 {t('dark')}
          </button>
          <button 
            className={`button ${settings.theme === 'system' ? 'primary' : ''}`}
            onClick={() => setSettings({ theme: 'system' })}
          >
            🖥️ {t('system')}
          </button>
        </div>
      </div>

      {/* Подтверждение удаления */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={settings.confirmDelete} 
            onChange={(e) => setSettings({ confirmDelete: e.target.checked })} 
          />
          <span>{t('confirmDeleteSetting')}</span>
        </label>
      </div>

      {/* Сортировка по умолчанию */}
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{t('defaultSort')}</label>
        <select 
          className="select"
          value={settings.defaultSort} 
          onChange={(e) => setSettings({ defaultSort: e.target.value as any })}
        >
          <option value="createdAt">{t('sortByDate')}</option>
          <option value="title">{t('sortByTitle')}</option>
          <option value="priority">{t('sortByPriority')}</option>
        </select>
      </div>
    </div>
  );
};

export default SettingsPanel;