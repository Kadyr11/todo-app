import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const TITLES: Record<string, string> = {
  "": "Список задач",
  "deleted": "Удалённые задачи",
  "archived": "Архив",
};

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const title = TITLES[seg] ?? decodeURIComponent(seg);
    const isLast = i === segments.length - 1;
    return { href, title, isLast };
  });

  return (
    <nav aria-label="Хлебные крошки" className="mb-3">
      <ol className="flex items-center gap-2 text-sm">
        <li>
          <Link to="/" className="opacity-80 hover:opacity-100 underline-offset-2 hover:underline">
            ← Домой
          </Link>
        </li>

        {crumbs.map(({ href, title, isLast }) => (
          <li key={href} className="flex items-center gap-2">
            <span className="opacity-40">›</span>
            {isLast ? (
              <span className="font-medium" aria-current="page">{title}</span>
            ) : (
              <Link to={href} className="opacity-80 hover:opacity-100 underline-offset-2 hover:underline">
                {title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
