import { SessionCard } from '@/components/session/SessionCard';
import { useSessionStore } from '@/stores/sessionStore';

export function SessionHistory() {
  const { sessions } = useSessionStore();

  const closedSessions = sessions.filter((s) => s.status === 'closed');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Session History
        </h1>
        <p className="text-sm text-muted-foreground">
          Review past sessions and orders
        </p>
      </div>

      {closedSessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/50 py-16 text-center">
          <p className="text-muted-foreground">No sessions yet</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
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

