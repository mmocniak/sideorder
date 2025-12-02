import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { MenuItem, CustomizationOption } from '@/db/types';

interface OrderEntryProps {
  items: MenuItem[];
  customizations: CustomizationOption[];
  onSubmit: (order: {
    itemName: string;
    itemCategory: MenuItem['category'];
    customizations: {
      temperature?: string;
      milk?: string;
      syrup?: string;
      size?: string;
    };
    notes: string;
  }) => void;
}

export function OrderEntry({ items, customizations, onSubmit }: OrderEntryProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedCustomizations, setSelectedCustomizations] = useState<{
    temperature?: string;
    milk?: string;
    syrup?: string;
    size?: string;
  }>({});
  const [notes, setNotes] = useState('');

  const categories = ['espresso', 'drip', 'tea', 'other'] as const;
  const categoryLabels: Record<typeof categories[number], string> = {
    espresso: 'Espresso',
    drip: 'Drip',
    tea: 'Tea',
    other: 'Other',
  };

  const customizationsByCategory = customizations.reduce((acc, opt) => {
    if (!acc[opt.category]) acc[opt.category] = [];
    acc[opt.category].push(opt);
    return acc;
  }, {} as Record<string, CustomizationOption[]>);

  const handleItemSelect = (item: MenuItem) => {
    setSelectedItem(item);
    // Set sensible defaults
    setSelectedCustomizations({
      temperature: customizationsByCategory.temperature?.[0]?.name,
      size: customizationsByCategory.size?.[1]?.name ?? customizationsByCategory.size?.[0]?.name,
    });
    setNotes('');
  };

  const handleSubmit = () => {
    if (!selectedItem) return;

    onSubmit({
      itemName: selectedItem.name,
      itemCategory: selectedItem.category,
      customizations: selectedCustomizations,
      notes,
    });

    setSelectedItem(null);
    setSelectedCustomizations({});
    setNotes('');
  };

  const handleQuickAdd = (item: MenuItem) => {
    // For quick add, use defaults
    onSubmit({
      itemName: item.name,
      itemCategory: item.category,
      customizations: {
        temperature: customizationsByCategory.temperature?.[0]?.name,
        size: customizationsByCategory.size?.[1]?.name ?? customizationsByCategory.size?.[0]?.name,
      },
      notes: '',
    });
  };

  return (
    <>
      {/* Item Grid */}
      <div className="space-y-4">
        {categories.map((category) => {
          const categoryItems = items.filter((item) => item.category === category);
          if (categoryItems.length === 0) return null;

          return (
            <div key={category}>
              <h3 className="mb-2 text-sm font-medium text-oat-600">
                {categoryLabels[category]}
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {categoryItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemSelect(item)}
                    onDoubleClick={() => handleQuickAdd(item)}
                    className="group relative rounded-lg border border-oat-200 bg-white p-3 text-left transition-all hover:border-terracotta hover:shadow-warm"
                  >
                    <span className="font-medium text-espresso">{item.name}</span>
                    <Plus className="absolute right-2 top-2 h-4 w-4 text-oat-400 opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Customization Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Temperature */}
            {customizationsByCategory.temperature && (
              <CustomizationGroup
                label="Temperature"
                options={customizationsByCategory.temperature}
                selected={selectedCustomizations.temperature}
                onSelect={(value) =>
                  setSelectedCustomizations((prev) => ({ ...prev, temperature: value }))
                }
              />
            )}

            {/* Size */}
            {customizationsByCategory.size && (
              <CustomizationGroup
                label="Size"
                options={customizationsByCategory.size}
                selected={selectedCustomizations.size}
                onSelect={(value) =>
                  setSelectedCustomizations((prev) => ({ ...prev, size: value }))
                }
              />
            )}

            {/* Milk */}
            {customizationsByCategory.milk && (
              <CustomizationGroup
                label="Milk"
                options={customizationsByCategory.milk}
                selected={selectedCustomizations.milk}
                onSelect={(value) =>
                  setSelectedCustomizations((prev) => ({ ...prev, milk: value }))
                }
              />
            )}

            {/* Syrup */}
            {customizationsByCategory.syrup && (
              <CustomizationGroup
                label="Syrup"
                options={customizationsByCategory.syrup}
                selected={selectedCustomizations.syrup}
                onSelect={(value) =>
                  setSelectedCustomizations((prev) => ({ ...prev, syrup: value }))
                }
              />
            )}

            {/* Notes */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-espresso">
                Notes
              </label>
              <Input
                placeholder="Extra hot, light ice, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setSelectedItem(null)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              Add Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface CustomizationGroupProps {
  label: string;
  options: CustomizationOption[];
  selected?: string;
  onSelect: (value: string) => void;
}

function CustomizationGroup({
  label,
  options,
  selected,
  onSelect,
}: CustomizationGroupProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-espresso">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.name)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm transition-colors',
              selected === option.name
                ? 'border-terracotta bg-terracotta text-white'
                : 'border-oat-200 bg-white text-espresso hover:border-oat-300'
            )}
          >
            {option.name}
          </button>
        ))}
      </div>
    </div>
  );
}
