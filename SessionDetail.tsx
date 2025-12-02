import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SessionStats } from '@/components/session/SessionStats';
import { OrderList } from '@/components/session/OrderList';
import { useSessionStore } from '@/stores/sessionStore';
import { useOrderStore } from '@/stores/orderStore';
import { formatSessionDate, formatTime } from '@/lib/utils';

export function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sessions, deleteSession } = useSessionStore();
  const { orders, loadOrdersForSession, clearOrders } = useOrderStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const session = sessions.find((s) => s.id === id);

  useEffect(() => {
    if (id) {
      loadOrdersForSession(id);
    }
    return () => clearOrders();
  }, [id, loadOrdersForSession, clearOrders]);

  if (!session) {
    return (
      <div className="py-16 text-center">
        <p className="text-oat-500">Session not found</p>
        <Button variant="link" onClick={() => navigate('/history')}>
          Back to history
        </Button>
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteSession(session.id);
    navigate('/history');
  };

  // Organize orders by item for summary
  const orderSummary = orders.reduce((acc, order) => {
    const key = order.itemName;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/history')}
          className="-ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          History
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-oat-500 hover:text-red-600"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Session Info */}
      <div>
        <h1 className="font-display text-2xl font-bold text-espresso">
          {formatSessionDate(session.startedAt)}
        </h1>
        <div className="mt-1 flex items-center gap-4 text-sm text-oat-600">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatTime(session.startedAt)}
            {session.endedAt && ` – ${formatTime(session.endedAt)}`}
          </span>
        </div>
        {session.notes && (
          <p className="mt-2 text-sm italic text-oat-600">
            "{session.notes}"
          </p>
        )}
      </div>

      {/* Stats */}
      <SessionStats session={session} orderCount={orders.length} />

      {/* Order Summary */}
      {Object.keys(orderSummary).length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold text-espresso">
            Summary
          </h2>
          <div className="rounded-xl bg-white p-4 shadow-warm">
            <div className="space-y-2">
              {Object.entries(orderSummary)
                .sort((a, b) => b[1] - a[1])
                .map(([item, count]) => (
                  <div
                    key={item}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-espresso">{item}</span>
                    <span className="font-medium text-oat-600">×{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* All Orders */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-espresso">
          All Orders
        </h2>
        <OrderList orders={orders} readonly />
      </div>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Session?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-oat-600">
            This will permanently delete this session and all {orders.length} orders.
            This action cannot be undone.
          </p>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
