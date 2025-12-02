import { SessionCard } from '@/components/session/SessionCard';
import { useSessionStore } from '@/stores/sessionStore';

export function SessionHistory() {
  const { sessions } = useSessionStore();

  const closedSessions = sessions.filter((s) => s.status === 'closed');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-espresso">
          Session History
        </h1>
        <p className="text-sm text-oat-600">
          Review past sessions and orders
        </p>
      </div>

      {closedSessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-oat-300 bg-oat-50 py-16 text-center">
          <p className="text-oat-500">No sessions yet</p>
          <p className="mt-1 text-sm text-oat-400">
            Completed sessions will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {closedSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}

