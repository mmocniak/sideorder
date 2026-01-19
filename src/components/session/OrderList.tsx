import { useState } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatTime, formatPrice, calculateOrderPrice } from '@/lib/utils';
import type { Order, MenuSnapshot } from '@/db/types';
import { isNewCustomizations } from '@/db/types';

interface OrderListProps {
  orders: Order[];
  onDelete?: (id: string) => void;
  onEdit?: (order: Order) => void;
  readonly?: boolean;
  menuSnapshot?: MenuSnapshot;
}

export function OrderList({ orders, onDelete, onEdit, readonly = false, menuSnapshot }: OrderListProps) {
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
          onEdit={onEdit}
          readonly={readonly}
          menuSnapshot={menuSnapshot}
        />
      ))}
    </div>
  );
}

interface OrderItemProps {
  order: Order;
  onDelete?: (id: string) => void;
  onEdit?: (order: Order) => void;
  readonly?: boolean;
  menuSnapshot?: MenuSnapshot;
}

function formatCustomizations(order: Order): string[] {
  const { customizations } = order;

  if (isNewCustomizations(customizations)) {
    // New format: { [groupId]: string[] }
    return Object.values(customizations)
      .flat()
      .filter((value) => value && value.toLowerCase() !== 'none');
  }

  // Legacy format: { temperature?: string, milk?: string, ... }
  return Object.values(customizations)
    .filter((value): value is string =>
      typeof value === 'string' && value.toLowerCase() !== 'none'
    );
}

function OrderItem({ order, onDelete, onEdit, readonly, menuSnapshot }: OrderItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const customizations = formatCustomizations(order);
  const price = menuSnapshot ? calculateOrderPrice(order, menuSnapshot) : null;

  return (
    <>
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
        <div className="flex items-center gap-2">
          {menuSnapshot && (
            <span className="text-sm font-medium text-oat-600">
              {formatPrice(price)}
            </span>
          )}
          {!readonly && (
            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(order)}
                >
                  <Pencil className="h-4 w-4 text-oat-500" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 text-oat-500" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Order"
        description={`Are you sure you want to delete the ${order.itemName} order?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={() => onDelete?.(order.id)}
      />
    </>
  );
}

