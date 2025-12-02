import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Home } from '@/pages/Home';
import { ActiveSession } from '@/pages/ActiveSession';
import { SessionHistory } from '@/pages/SessionHistory';
import { SessionDetail } from '@/pages/SessionDetail';
import { Menu } from '@/pages/Menu';
import { initializeDatabase } from '@/db';
import { useSessionStore } from '@/stores/sessionStore';
import { useMenuStore } from '@/stores/menuStore';

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const loadSessions = useSessionStore((state) => state.loadSessions);
  const loadMenu = useMenuStore((state) => state.loadMenu);

  useEffect(() => {
    async function init() {
      await initializeDatabase();
      await Promise.all([loadSessions(), loadMenu()]);
      setIsReady(true);
    }
    init();
  }, [loadSessions, loadMenu]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-full bg-espresso" />
          <p className="text-oat-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/session" element={<ActiveSession />} />
        <Route path="/history" element={<SessionHistory />} />
        <Route path="/history/:id" element={<SessionDetail />} />
        <Route path="/menu" element={<Menu />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
