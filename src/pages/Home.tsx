import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SessionCard } from '@/components/session/SessionCard';
import { useSessionStore } from '@/stores/sessionStore';
import { useMenuStore } from '@/stores/menuStore';

export function Home() {
  const navigate = useNavigate();
  const { sessions, activeSession, startSession } = useSessionStore();
  const { getSnapshot } = useMenuStore();
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [sessionName, setSessionName] = useState('');

  const recentSessions = sessions
    .filter((s) => s.status === 'closed')
    .slice(0, 3);

  const handleStartSession = async () => {
    const snapshot = getSnapshot();
    await startSession(snapshot, sessionName.trim());
    setSessionName('');
    setShowStartDialog(false);
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
            <Button onClick={() => setShowStartDialog(true)} className="mt-4 w-full">
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

      {/* Start Session Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="sessionName">Session Name (optional)</Label>
              <Input
                id="sessionName"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g., Saturday Market, Morning Shift"
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowStartDialog(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleStartSession}>
              Start
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Version */}
      <p className="pt-4 text-center text-xs text-oat-400">v{__APP_VERSION__}</p>
    </div>
  );
}

