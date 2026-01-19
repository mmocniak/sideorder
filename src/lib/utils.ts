import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Order, MenuSnapshot } from '@/db/types';
import { isNewCustomizations } from '@/db/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDuration(startMs: number, endMs?: number): string {
  const end = endMs ?? Date.now();
  const durationMs = end - startMs;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatSessionDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a price for display.
 * Returns "—" for null/undefined prices.
 */
export function formatPrice(price: number | null | undefined): string {
  if (price == null) {
    return '—';
  }
  return `$${price.toFixed(2)}`;
}

/**
 * Calculate the total price for an order using the session's menu snapshot.
 * Returns null if the item doesn't have a baseCost.
 */
export function calculateOrderPrice(
  order: Order,
  menuSnapshot: MenuSnapshot
): number | null {
  // Find the menu item by name
  const menuItem = menuSnapshot.items.find(
    (item) => item.name === order.itemName
  );

  // If no item found or no base cost, return null
  if (!menuItem || menuItem.baseCost == null) {
    return null;
  }

  let total = menuItem.baseCost;

  // Add modifier price additives
  const { customizations } = order;

  if (isNewCustomizations(customizations)) {
    // New format: { [groupId]: string[] }
    for (const [groupId, selectedOptions] of Object.entries(customizations)) {
      const modifierGroup = menuSnapshot.modifierGroups?.find(
        (g) => g.id === groupId
      );
      if (modifierGroup) {
        for (const optionName of selectedOptions) {
          const option = modifierGroup.options.find(
            (o) => o.name === optionName
          );
          if (option?.priceAdditive) {
            total += option.priceAdditive;
          }
        }
      }
    }
  } else {
    // Legacy format: { temperature?, milk?, syrup?, size? }
    // Try to match by group name
    for (const [key, value] of Object.entries(customizations)) {
      if (!value) continue;
      const modifierGroup = menuSnapshot.modifierGroups?.find(
        (g) => g.name.toLowerCase() === key.toLowerCase()
      );
      if (modifierGroup) {
        const option = modifierGroup.options.find((o) => o.name === value);
        if (option?.priceAdditive) {
          total += option.priceAdditive;
        }
      }
    }
  }

  return total;
}

/**
 * Calculate total revenue for a list of orders.
 * Returns null if no orders have prices.
 */
export function calculateTotalRevenue(
  orders: Order[],
  menuSnapshot: MenuSnapshot
): number | null {
  let total = 0;
  let hasAnyPrice = false;

  for (const order of orders) {
    const price = calculateOrderPrice(order, menuSnapshot);
    if (price != null) {
      total += price;
      hasAnyPrice = true;
    }
  }

  return hasAnyPrice ? total : null;
}

