import { useNavigate } from 'react-router-dom';
import { Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SessionCard } from '@/components/session/SessionCard';
import { useSessionStore } from '@/stores/sessionStore';
import { useMenuStore } from '@/stores/menuStore';

export function Home() {
  const navigate = useNavigate();
  const { sessions, activeSession, startSession } = useSessionStore();
  const { getSnapshot } = useMenuStore();

  const recentSessions = sessions
    .filter((s) => s.status === 'closed')
    .slice(0, 3);

  const handleStartSession = async () => {
    const snapshot = getSnapshot();
    await startSession(snapshot);
    navigate('/session');
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-espresso">
          Side Order
        </h1>
        <p className="mt-1 text-oat-600">Session tracking for Side Hustle</p>
      </div>

      {/* Active Session or Start New */}
      {activeSession ? (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-espresso">
            Active Session
          </h2>
          <SessionCard session={activeSession} />
        </div>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-oat-100">
              <Plus className="h-8 w-8 text-espresso" />
            </div>
            <h2 className="font-display text-xl font-semibold text-espresso">
              Ready to open?
            </h2>
            <p className="mt-1 text-sm text-oat-600">
              Start a new session to begin logging orders
            </p>
            <Button onClick={handleStartSession} className="mt-4 w-full">
              Start Session
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-espresso">
              Recent Sessions
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/history')}
              className="text-terracotta"
            >
              <Clock className="mr-1 h-4 w-4" />
              View all
            </Button>
          </div>
          <div className="space-y-2">
            {recentSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
