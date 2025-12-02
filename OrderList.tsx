import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/utils';
import type { Order } from '@/db/types';

interface OrderListProps {
  orders: Order[];
  onDelete?: (id: string) => void;
  readonly?: boolean;
}

export function OrderList({ orders, onDelete, readonly = false }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-oat-300 bg-oat-50 py-12 text-center">
        <p className="text-oat-500">No orders yet</p>
        <p className="mt-1 text-sm text-oat-400">
          Tap a drink to log an order
        </p>
      </div>
    );
  }

  // Show newest first
  const sortedOrders = [...orders].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-2">
      {sortedOrders.map((order) => (
        <OrderItem
          key={order.id}
          order={order}
          onDelete={onDelete}
          readonly={readonly}
        />
      ))}
    </div>
  );
}

interface OrderItemProps {
  order: Order;
  onDelete?: (id: string) => void;
  readonly?: boolean;
}

function OrderItem({ order, onDelete, readonly }: OrderItemProps) {
  const customizations = Object.entries(order.customizations)
    .filter(([, value]) => value && value.toLowerCase() !== 'none')
    .map(([, value]) => value);

  return (
    <div className="group flex items-center justify-between rounded-lg bg-white p-3 shadow-warm">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-espresso">{order.itemName}</span>
          <span className="text-xs text-oat-500">{formatTime(order.timestamp)}</span>
        </div>
        {customizations.length > 0 && (
          <p className="mt-0.5 text-sm text-oat-600">
            {customizations.join(' · ')}
          </p>
        )}
        {order.notes && (
          <p className="mt-0.5 text-xs italic text-oat-500">"{order.notes}"</p>
        )}
      </div>
      {!readonly && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => onDelete(order.id)}
        >
          <Trash2 className="h-4 w-4 text-oat-500" />
        </Button>
      )}
    </div>
  );
}
