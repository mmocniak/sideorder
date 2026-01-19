# Claude Context for Side Order

## What This Is
A local-first PWA for tracking orders at pop-up coffee sessions. Not a POS — no payments, no receipts. Focused on operational insight: what's ordered, session duration, and eventually cost tracking.

## Tech Stack
- **React 18** with hooks (no class components)
- **React Router 6** with nested routes
- **Zustand** for state (stores in `src/stores/`)
- **Dexie** wrapping IndexedDB (setup in `src/db/`)
- **Tailwind + ShadCN** for UI (`src/components/ui/`)
- **Vite** with PWA plugin

## Key Files
- `src/db/types.ts` — All TypeScript interfaces
- `src/db/index.ts` — Dexie schema and seeding
- `src/stores/menuStore.ts` — Menu items, modifier groups, categories
- `src/stores/sessionStore.ts` — Sessions and active session state
- `src/stores/orderStore.ts` — Orders for current/viewed session
- `src/stores/settingsStore.ts` — App settings (shop name, etc.)

## Code Patterns

### Zustand Store Actions
All store actions persist to Dexie first, then update local state:
```typescript
addItem: async (item) => {
  const newItem = { ...item, id: generateId(), createdAt: Date.now(), updatedAt: Date.now() };
  await db.menuItems.add(newItem);  // persist first
  set((state) => ({ items: [...state.items, newItem] }));  // then update UI
}
```

### IDs and Timestamps
- Use `generateId()` from `@/lib/utils` for all new records
- Use `Date.now()` for timestamps (number, not Date object)
- `NewXxx` types (e.g., `NewMenuItem`) omit `id`, `createdAt`, `updatedAt`

### Type Guards
Use `isNewCustomizations()` from `src/db/types.ts` to handle legacy vs new customization formats.

## Design Decisions

### Menu Snapshots
When a session starts, we freeze a copy of the menu. Mid-session edits update both the live menu AND the active session's snapshot. Closed sessions keep their original snapshot.

### Denormalized Orders
Orders store `itemName`, `itemCategory`, and customization values directly — not foreign keys. Historical orders stay accurate even if items are renamed/deleted.

### Local-First
All data in IndexedDB. No backend, no auth. Data persists in browser only.

## UI Components
- ShadCN primitives in `src/components/ui/` — manually added, not via CLI
- Use `cn()` from `@/lib/utils` for class merging
- Theme: "Warm Counter" — cream background (#FAF7F2), espresso primary (#5C4033), terracotta accent (#C67D4D)

## Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run dev -- --host  # Test on mobile via local network
```
