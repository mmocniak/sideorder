import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, ChevronRight, Coffee } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatSessionDate, formatTime, formatDuration } from '@/lib/utils';
import { getOrderCountForSession } from '@/stores/orderStore';
import type { Session } from '@/db/types';

interface SessionCardProps {
  session: Session;
  linkTo?: string;
}

export function SessionCard({ session, linkTo }: SessionCardProps) {
  const [orderCount, setOrderCount] = useState<number>(0);

  useEffect(() => {
    getOrderCountForSession(session.id).then(setOrderCount);
  }, [session.id]);

  const isActive = session.status === 'active';
  const destination = linkTo ?? (isActive ? '/session' : `/history/${session.id}`);

  return (
    <Link to={destination}>
      <Card className="group relative overflow-hidden transition-shadow hover:shadow-warm-lg">
        {isActive && (
          <div className="absolute left-0 top-0 h-full w-1 bg-terracotta" />
        )}
        <div className="flex items-center justify-between p-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-display font-medium text-espresso">
                {formatSessionDate(session.startedAt)}
              </span>
              {isActive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-terracotta/10 px-2 py-0.5 text-xs font-medium text-terracotta">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-terracotta" />
                  Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-oat-600">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(session.startedAt)}
                {session.endedAt && ` – ${formatTime(session.endedAt)}`}
              </span>
              <span className="flex items-center gap-1">
                <Coffee className="h-3.5 w-3.5" />
                {orderCount} {orderCount === 1 ? 'order' : 'orders'}
              </span>
              {session.customerCount !== undefined && session.customerCount > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {session.customerCount}
                </span>
              )}
            </div>
            {!isActive && session.endedAt && (
              <p className="text-xs text-oat-500">
                Duration: {formatDuration(session.startedAt, session.endedAt)}
              </p>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-oat-400 transition-transform group-hover:translate-x-0.5" />
        </div>
      </Card>
    </Link>
  );
}
