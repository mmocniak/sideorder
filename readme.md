# Side Order

Session-based order tracking for **Side Hustle Coffee**. A lightweight PWA for logging orders during service, tracking material usage, and reviewing session history.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. For iOS PWA experience, add to home screen.

---

## Project Context

This app helps a coffee shop owner track orders during pop-up sessions. It's **not** a POS — no payments, no receipts. The goal is operational insight: what's being ordered, how long sessions run, and eventually, what it costs to operate.

### Core Loop

1. **Start a session** — captures a snapshot of the current menu
2. **Log orders** as they come in — each timestamped with customizations
3. **End the session** — locks the snapshot, records duration
4. **Review history** — see what was ordered, when, and how much

### Key Design Decisions

- **Menu snapshots**: When a session starts, we freeze a copy of the menu. Mid-session edits update both the live menu AND the active session's snapshot. Closed sessions keep their original snapshot for accurate historical data.

- **Denormalized orders**: Orders store `itemName` and customization values directly, not foreign keys. This means historical orders stay accurate even if menu items are renamed or deleted later.

- **Local-first**: All data lives in IndexedDB via Dexie. No backend, no auth. Data persists in the browser.

---

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | React 18 | Standard hooks, no class components |
| Routing | React Router 6 | Nested routes under AppShell |
| State | Zustand | Three stores: menu, session, order |
| Storage | Dexie (IndexedDB) | Typed tables, reactive queries available |
| Styling | Tailwind + ShadCN | Custom "Warm Counter" theme |
| Build | Vite | PWA plugin configured |

---

## File Structure

```
src/
├── components/
│   ├── ui/           # ShadCN primitives (Button, Card, Dialog, etc.)
│   ├── layout/       # AppShell, Header
│   ├── session/      # SessionCard, SessionStats, OrderList, OrderEntry
│   └── menu/         # MenuItemCard, MenuItemForm
├── pages/
│   ├── Home.tsx           # Landing, start session, recent sessions
│   ├── ActiveSession.tsx  # Live order logging
│   ├── SessionHistory.tsx # List of closed sessions
│   ├── SessionDetail.tsx  # View a specific closed session
│   └── Menu.tsx           # Manage items and customizations
├── stores/
│   ├── menuStore.ts       # Menu items + customizations
│   ├── sessionStore.ts    # Sessions + active session
│   └── orderStore.ts      # Orders for current/viewed session
├── db/
│   ├── index.ts           # Dexie setup + seeding
│   └── types.ts           # TypeScript interfaces
└── lib/
    └── utils.ts           # cn(), formatters, ID generation
```

---

## Data Model

```typescript
MenuItem {
  id, name, category, baseCost?, available, createdAt, updatedAt
}

CustomizationOption {
  id, category (temperature|milk|syrup|size), name, costModifier?, available
}

Session {
  id, status (active|closed), startedAt, endedAt?, customerCount?, notes,
  menuSnapshot: { items: MenuItem[], customizations: CustomizationOption[] }
}

Order {
  id, sessionId, timestamp, itemName, itemCategory,
  customizations: { temperature?, milk?, syrup?, size? },
  notes
}
```

---

## Theme: "Warm Counter"

| Role | Color | Hex |
|------|-------|-----|
| Background | Cream | `#FAF7F2` |
| Surface | White | `#FFFFFF` |
| Primary | Espresso | `#5C4033` |
| Accent | Terracotta | `#C67D4D` |
| Muted | Oat | `#D4C9BE` |
| Text | Dark Roast | `#2C2420` |

Fonts: **Inter** (body), **Fraunces** (display headings)

---

## What's Working

- [x] Start/end sessions
- [x] Log orders with customizations
- [x] View session history and details
- [x] Menu item CRUD (add, edit, hide, delete)
- [x] Menu snapshots per session
- [x] Mid-session menu edits update active snapshot
- [x] PWA manifest configured
- [x] Responsive, mobile-first layout

---

## What's Next

Planned features roughly in priority order:

### Near-term
- [ ] **Customization CRUD** — add/edit/remove milk types, syrups, sizes from the Menu page
- [ ] **Order editing** — tap an order to modify it (currently can only delete)
- [ ] **Confirmation toasts** — feedback when orders are added, sessions ended, etc.

### Medium-term
- [ ] **Cost tracking** — set costs on items/customizations, calculate session totals
- [ ] **Session summary export** — CSV or shareable summary
- [ ] **Usage reports** — charts showing popular items, busy times, trends

### Long-term
- [ ] **Multi-location support** — if Side Hustle expands
- [ ] **Cloud sync** — optional backup/restore
- [ ] **Offline resilience** — service worker caching for full offline use

---

## Development Notes

### Adding a new ShadCN component

Components are manually added (no CLI in this setup). Copy from [ui.shadcn.com](https://ui.shadcn.com), paste into `src/components/ui/`, and update imports to use `@/lib/utils` for `cn()`.

### Store patterns

Stores use Zustand with async actions that write to Dexie first, then update local state. Example:

```typescript
addItem: async (item) => {
  const newItem = { ...item, id: generateId(), ... };
  await db.menuItems.add(newItem);  // persist
  set((state) => ({ items: [...state.items, newItem] }));  // update UI
}
```

### Testing locally on mobile

```bash
npm run dev -- --host
```

Then open `http://<your-ip>:5173` on your phone. For PWA install testing, you'll need HTTPS (use a tunnel like ngrok or deploy to Vercel/Netlify).

---

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build locally
```

---

## Questions for the Owner

Things to clarify as development continues:

1. Do you want to track **who** placed each order, or is it purely anonymous volume tracking?
2. For cost tracking, should we support different costs per customization (e.g., oat milk costs more)?
3. Any interest in a "quick session" mode that skips the full UI for rapid logging?
4. Should closed sessions be editable, or strictly read-only?

---

Built with care for Side Hustle Coffee ☕