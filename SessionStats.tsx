import { useEffect, useState } from 'react';
import { Clock, Coffee, Users } from 'lucide-react';
import { formatDuration, formatTime } from '@/lib/utils';
import type { Session } from '@/db/types';

interface SessionStatsProps {
  session: Session;
  orderCount: number;
}

export function SessionStats({ session, orderCount }: SessionStatsProps) {
  const [elapsed, setElapsed] = useState(() =>
    formatDuration(session.startedAt)
  );

  useEffect(() => {
    if (session.status !== 'active') return;

    const interval = setInterval(() => {
      setElapsed(formatDuration(session.startedAt));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [session.startedAt, session.status]);

  const stats = [
    {
      icon: Clock,
      label: 'Duration',
      value: session.endedAt
        ? formatDuration(session.startedAt, session.endedAt)
        : elapsed,
    },
    {
      icon: Coffee,
      label: 'Orders',
      value: orderCount.toString(),
    },
    {
      icon: Users,
      label: 'Customers',
      value: session.customerCount?.toString() ?? '—',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="flex flex-col items-center rounded-xl bg-oat-100 p-3"
        >
          <Icon className="mb-1 h-5 w-5 text-oat-500" />
          <span className="font-display text-lg font-semibold text-espresso">
            {value}
          </span>
          <span className="text-xs text-oat-600">{label}</span>
        </div>
      ))}
    </div>
  );
}
