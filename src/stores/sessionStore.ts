import { create } from 'zustand';
import { db } from '@/db';
import type { Session, MenuSnapshot } from '@/db/types';
import { generateId } from '@/lib/utils';

interface SessionState {
  sessions: Session[];
  activeSession: Session | null;
  isLoading: boolean;

  // Actions
  loadSessions: () => Promise<void>;
  startSession: (menuSnapshot: MenuSnapshot, name?: string) => Promise<Session>;
  updateSession: (id: string, updates: Partial<Session>) => Promise<void>;
  updateActiveSessionSnapshot: (snapshot: MenuSnapshot) => Promise<void>;
  endSession: (id: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  activeSession: null,
  isLoading: true,

  loadSessions: async () => {
    set({ isLoading: true });
    const sessions = await db.sessions.orderBy('startedAt').reverse().toArray();
    const activeSession = sessions.find((s) => s.status === 'active') ?? null;
    set({ sessions, activeSession, isLoading: false });
  },

  startSession: async (menuSnapshot, name?: string) => {
    const newSession: Session = {
      id: generateId(),
      name: name || '',
      status: 'active',
      startedAt: Date.now(),
      notes: '',
      menuSnapshot,
    };
    await db.sessions.add(newSession);
    set((state) => ({
      sessions: [newSession, ...state.sessions],
      activeSession: newSession,
    }));
    return newSession;
  },

  updateSession: async (id, updates) => {
    await db.sessions.update(id, updates);
    set((state) => {
      const updatedSessions = state.sessions.map((session) =>
        session.id === id ? { ...session, ...updates } : session
      );
      const activeSession =
        state.activeSession?.id === id
          ? { ...state.activeSession, ...updates }
          : state.activeSession;
      return { sessions: updatedSessions, activeSession };
    });
  },

  updateActiveSessionSnapshot: async (snapshot) => {
    const { activeSession } = get();
    if (!activeSession) return;
    
    await db.sessions.update(activeSession.id, { menuSnapshot: snapshot });
    set((state) => {
      if (!state.activeSession) return state;
      const updated = { ...state.activeSession, menuSnapshot: snapshot };
      return {
        activeSession: updated,
        sessions: state.sessions.map((s) =>
          s.id === updated.id ? updated : s
        ),
      };
    });
  },

  endSession: async (id) => {
    const updates = { status: 'closed' as const, endedAt: Date.now() };
    await db.sessions.update(id, updates);
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === id ? { ...session, ...updates } : session
      ),
      activeSession: state.activeSession?.id === id ? null : state.activeSession,
    }));
  },

  deleteSession: async (id) => {
    // Also delete all orders for this session
    await db.orders.where('sessionId').equals(id).delete();
    await db.sessions.delete(id);
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      activeSession: state.activeSession?.id === id ? null : state.activeSession,
    }));
  },
}));

