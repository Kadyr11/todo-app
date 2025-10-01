import React from 'react';
import { useTranslation } from 'react-i18next';

interface ApiStatusBarProps {
  apiOk: boolean | null;
  className?: string;
}

const ApiStatusBar: React.FC<ApiStatusBarProps> = ({ apiOk, className = '' }) => {
  const { t } = useTranslation();

  const getStatusClass = () => {
    if (apiOk === null) return 'warn';
    return apiOk ? 'ok' : 'err';
  };

  const getStatusText = () => {
    if (apiOk === null) return '…';
    return apiOk ? t('apiOk') : t('apiFail');
  };

  return (
    <div className={`banner status-bar ${getStatusClass()} ${className}`.trim()}>
      {getStatusText()}
    </div>
  );
};

export default ApiStatusBar;