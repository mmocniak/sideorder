import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, Settings, Sun, Moon, Monitor } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SessionCard } from '@/components/session/SessionCard';
import { useSessionStore } from '@/stores/sessionStore';
import { useMenuStore } from '@/stores/menuStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { getTagline } from '@/lib/taglines';
import type { Theme } from '@/lib/theme';

export function Home() {
  const navigate = useNavigate();
  const { sessions, activeSession, startSession } = useSessionStore();
  const { getSnapshot } = useMenuStore();
  const { shopName, updateShopName, theme, updateTheme } = useSettingsStore();
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [editingShopName, setEditingShopName] = useState('');

  // Get tagline once per session (stored in sessionStorage)
  const tagline = useMemo(() => getTagline(), []);

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
        <h1 className="font-display text-3xl font-bold text-foreground">
          {shopName}
        </h1>
        <p className="mt-1 text-muted-foreground">{tagline}</p>
      </div>

      {/* Active Session or Start New */}
      {activeSession ? (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Active Session
          </h2>
          <SessionCard session={activeSession} />
        </div>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Plus className="h-8 w-8 text-foreground" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Ready to open?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
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
            <h2 className="font-display text-lg font-semibold text-foreground">
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

      {/* Version & Settings */}
      <div className="flex flex-col items-center gap-2 pt-4">
        <p className="text-xs text-muted-foreground/60">v{__APP_VERSION__}</p>
        <button
          onClick={() => {
            setEditingShopName(shopName);
            setShowSettingsDialog(true);
          }}
          className="flex min-h-0 items-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary/80"
        >
          <Settings className="h-3 w-3" />
          Settings
        </button>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="shopName">Shop Name</Label>
              <Input
                id="shopName"
                value={editingShopName}
                onChange={(e) => setEditingShopName(e.target.value)}
                placeholder="Side Order"
                autoComplete="off"
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Displayed at the top of the home page
              </p>
            </div>
            <div>
              <Label>Theme</Label>
              <Select value={theme} onValueChange={(v) => updateTheme(v as Theme)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <span className="flex items-center gap-2">
                      <Sun className="h-4 w-4" /> Light
                    </span>
                  </SelectItem>
                  <SelectItem value="dark">
                    <span className="flex items-center gap-2">
                      <Moon className="h-4 w-4" /> Dark
                    </span>
                  </SelectItem>
                  <SelectItem value="auto">
                    <span className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" /> Auto
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">
                Auto follows your system preference
              </p>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowSettingsDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={async () => {
                await updateShopName(editingShopName);
                setShowSettingsDialog(false);
              }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

