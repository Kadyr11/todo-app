import { Todo } from "../types";
import { useTranslation } from "react-i18next";

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="card todo-item">
      <input type="checkbox" checked={todo.completed} onChange={onToggle} disabled={!!todo.deletedAt} />
      <div className="todo-content">
        <div className="todo-title" style={{ textDecoration: todo.completed ? "line-through" : "none" }}>
          {todo.title}
        </div>
        {todo.description ? <div className="todo-description">{todo.description}</div> : null}
      </div>
      {todo.deletedAt ? (
        // When deleted, don't show normal delete; show placeholder (restore handled in DeletedTodosPanel)
        <span style={{ color: 'var(--muted)' }}>{new Date(todo.deletedAt).toLocaleString()}</span>
      ) : (
        <button className="button compact" onClick={onDelete}>{t("delete")}</button>
      )}
    </div>
  );
}