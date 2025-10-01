import React from 'react';
import { Outlet } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';

export default function Layout() {
  return (
    <div>
      <header className="container" style={{ padding: 'var(--space-3) 0 0 0' }} />

      <main className="container" style={{ padding: 'var(--space-2) 0 var(--space-3) 0' }}>
        <Outlet />
      </main>
    </div>
  );
}
