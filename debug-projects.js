// Тестовый скрипт для проверки типов archived в консоли браузера
// Запустите в консоли браузера для диагностики

fetch('/api/projects?includeArchived=true')
  .then(r => r.json())
  .then(a => {
    console.groupCollapsed('🔍 Диагностика типов archived');
    console.table(a.slice(0, 5).map(p => ({
      id: p.id, 
      archived: p.archived, 
      type: typeof p.archived,
      name: p.name
    })));
    console.log('Общее количество проектов:', a.length);
    console.log('Архивированных:', a.filter(p => p.archived).length);
    console.log('Активных:', a.filter(p => !p.archived).length);
    console.groupEnd();
  })
  .catch(err => console.error('Ошибка загрузки проектов:', err));