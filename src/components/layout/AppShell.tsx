import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-6 pb-24 safe-bottom">
        <Outlet />
      </main>
    </div>
  );
}

