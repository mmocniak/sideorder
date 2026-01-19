# Session Log

## v0.2.8

### New Features
- **Drag-to-reorder menu items** - Reorder items, modifiers, and categories on the Menu page using drag handles
- **Order editing** - Edit existing orders during an active session by tapping the pencil icon
- **Delete confirmation** - Orders now require confirmation before deletion
- **Price totals** - Display calculated prices throughout the app:
  - Individual order prices shown in order list
  - Running total in session stats card
  - Summary with prices per item type on closed sessions
  - Items without prices display "—"
- **Light/Dark/Auto theme toggle** - Choose between light mode, dark mode, or auto (follows system preference) from the Settings menu on the home page
  - Theme preference persists in IndexedDB
  - Auto mode responds to system theme changes in real-time

### Technical
- Added @dnd-kit for drag-and-drop functionality
- Added `sortOrder` field to MenuItem and ModifierGroup types
- Database migration v5 for existing item ordering
- New `SortableList` and `DragHandle` components
- Price calculation utilities: `calculateOrderPrice()`, `calculateTotalRevenue()`, `formatPrice()`
- Theme system using CSS custom properties with `.dark` class
- New `src/lib/theme.ts` utility for theme application and system change listener
- Added `theme` state to settings store
- Updated all UI components to use semantic color tokens (e.g., `text-foreground`, `bg-card`, `border-border`)

---

## v0.2.7

### New Features
- **Customizable shop name** - Replace "Side Order" with your own shop name via the Settings button on the home page
- **Rotating taglines** - Coffee-themed messages appear below the shop name, rotating on each fresh page load
- **Modifier price additives** - Add optional prices to individual modifiers (e.g., Oat Milk +$0.50)
- **Dynamic categories** - Full CRUD for menu categories (add, rename, reorder, delete) via Menu > Categories tab

### Fixes
- Tab container now properly hugs its content instead of using fixed height
- Dialog close button icon properly centered
