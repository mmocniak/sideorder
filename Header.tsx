import { Link, useLocation } from 'react-router-dom';
import { Coffee, Menu, Clock, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/history', icon: Clock, label: 'History' },
    { to: '/menu', icon: Menu, label: 'Menu' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-oat-200 bg-cream/80 backdrop-blur-md safe-top">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-espresso text-cream">
            <Coffee className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-semibold text-espresso">
            Side Order
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                  isActive
                    ? 'bg-espresso text-cream'
                    : 'text-oat-500 hover:bg-oat-100 hover:text-espresso'
                )}
                aria-label={label}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
