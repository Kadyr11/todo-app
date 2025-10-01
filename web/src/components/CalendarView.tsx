import React, { useEffect, useMemo, useState } from 'react';
import Calendar from 'react-calendar';
import { Todo } from '../types';
import { useTranslation } from 'react-i18next';
import 'react-calendar/dist/Calendar.css';

type DayData = { notes: string[]; important?: boolean };
type Store = Record<string, DayData>;

const keyFromDate = (d: Date) => {
  // фикс от часовых поясов: приводим к полудню
  const n = new Date(d); n.setHours(12, 0, 0, 0);
  return n.toISOString().slice(0, 10); // YYYY-MM-DD
};

interface CalendarViewProps {
  todos: Todo[];
  onTodoClick: (todo: Todo) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ todos, onTodoClick }) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<Date>(new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);

  const [store, setStore] = useState<Store>(() => {
    try { return JSON.parse(localStorage.getItem("notesCalendarV1") || "{}"); }
    catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem("notesCalendarV1", JSON.stringify(store));
  }, [store]);

  const selectedKey = useMemo(
    () => (selected ? keyFromDate(selected) : ""),
    [selected]
  );
  const dayData = selected ? store[selectedKey] : undefined;

  const openEditor = (date: Date) => {
    setSelected(date);
    setOpen(true);
  };

  const addNote = () => {
    if (!selected || !text.trim()) return;
    const k = selectedKey;
    const cur = store[k] || { notes: [], important: false };
    const next = { ...store, [k]: { ...cur, notes: [...cur.notes, text.trim()] } };
    setStore(next);
    setText("");
  };

  const removeNote = (i: number) => {
    if (!selected) return;
    const k = selectedKey;
    const cur = store[k]; if (!cur) return;
    const nextNotes = [...cur.notes]; nextNotes.splice(i, 1);
    setStore({ ...store, [k]: { ...cur, notes: nextNotes } });
  };

  const setImportant = (v: boolean) => {
    if (!selected) return;
    const k = selectedKey;
    const cur = store[k] || { notes: [] };
    setStore({ ...store, [k]: { ...cur, important: v } });
  };

  // Группируем задачи по датам
  const todosByDate = todos.reduce((acc, todo) => {
    if (todo.dueDate) {
      const date = new Date(todo.dueDate).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(todo);
    }
    return acc;
  }, {} as Record<string, Todo[]>);

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;

    const id = keyFromDate(date);
    const hasNotes = !!store[id]?.notes?.length;
    const isImportant = !!store[id]?.important;

    return (
      <div className="cal-notes__wrap">
        {hasNotes && <span className="cal-notes__dot"></span>}
        {isImportant && <span className="cal-notes__outline"></span>}
        {/* overlay больше НЕ button, а span */}
        <span
          className="cal-notes__overlay"
          role="button"
          tabIndex={0}
          aria-label={`Заметки на ${date.toLocaleDateString('ru-RU')}`}
          onClick={(e) => { e.stopPropagation(); openEditor(date); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEditor(date); }
          }}
        ></span>
      </div>
    );
  };

  // Функция для обработки клика по дате
  const onClickDay = (date: Date, ev: any) => {
    ev?.stopPropagation?.();
    openEditor(date);
  };

  return (
    <div className="calendar-view">
      <div className="card" style={{ margin: 'var(--space-2) 0' }}>
        <h3 style={{ marginBottom: 'var(--space-2)' }}>{t('calendar')}</h3>
        <Calendar
          onClickDay={(d)=> openEditor(d)}
          onChange={(d:any)=> setValue(d)}
          value={value}
          tileContent={tileContent}
          className="custom-calendar"
        />
      </div>

      {/* Список задач по выбранной дате можно добавить здесь */}
      <div className="calendar-todos">
        {Object.entries(todosByDate).map(([dateStr, dayTodos]) => (
          <div key={dateStr} className="calendar-day-group">
            <h4 style={{ margin: 'var(--space-2) 0 var(--space-1) 0' }}>
              {new Date(dateStr).toLocaleDateString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h4>
            <div className="todos">
              {dayTodos.map(todo => (
                <div
                  key={todo.id}
                  className="calendar-todo-item"
                  onClick={() => onTodoClick(todo)}
                  style={{
                    padding: 'var(--space-1)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    marginBottom: 'var(--space-1)',
                    cursor: 'pointer',
                    background: todo.completed ? 'var(--success-bg)' : 'var(--card)'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{todo.title}</div>
                  {todo.description && (
                    <div style={{ fontSize: '0.9em', color: 'var(--muted)' }}>
                      {todo.description}
                    </div>
                  )}
                  <div style={{
                    fontSize: '0.8em',
                    color: todo.completed ? 'var(--success-border)' : 'var(--muted)'
                  }}>
                    {todo.completed ? t('done') : t('pending')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Модал редактирования */}
      <div className={`notes-modal ${open ? "open" : ""}`}>
        <div className="overlay" onClick={() => setOpen(false)} />
        <div className="panel">
          <div className="panel-head">
            <div className="date">
              {selected?.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })}
            </div>
            <label className="important">
              <input
                type="checkbox"
                checked={!!dayData?.important}
                onChange={(e) => setImportant(e.target.checked)}
              />
              Важный день
            </label>
            <button className="close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <ul className="notes-list">
            {(dayData?.notes || []).map((n, i) => (
              <li key={i}>
                <span>{n}</span>
                <button className="del" onClick={() => removeNote(i)}>Удалить</button>
              </li>
            ))}
          </ul>

          <div className="add-row">
            <textarea
              placeholder="Новая заметка…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
            />
            <button className="add-btn" onClick={addNote}>Добавить</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;