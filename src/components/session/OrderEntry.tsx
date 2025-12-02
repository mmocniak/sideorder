import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { MenuItem, ModifierGroup, OrderCustomizations } from '@/db/types';

interface OrderEntryProps {
  items: MenuItem[];
  modifierGroups: ModifierGroup[];
  onSubmit: (order: {
    itemName: string;
    itemCategory: MenuItem['category'];
    customizations: OrderCustomizations;
    notes: string;
  }) => void;
}

export function OrderEntry({ items, modifierGroups, onSubmit }: OrderEntryProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<OrderCustomizations>({});
  const [notes, setNotes] = useState('');

  const categories = ['espresso', 'drip', 'tea', 'other'] as const;
  const categoryLabels: Record<typeof categories[number], string> = {
    espresso: 'Espresso',
    drip: 'Drip',
    tea: 'Tea',
    other: 'Other',
  };

  // Get modifier groups for the selected item
  const itemModifierGroups = useMemo(() => {
    if (!selectedItem) return [];
    return modifierGroups.filter((group) =>
      selectedItem.modifierGroupIds?.includes(group.id)
    );
  }, [selectedItem, modifierGroups]);

  // Check if all required groups have selections
  const hasAllRequired = useMemo(() => {
    return itemModifierGroups
      .filter((group) => group.required)
      .every((group) => {
        const selection = selectedOptions[group.id];
        return selection && selection.length > 0;
      });
  }, [itemModifierGroups, selectedOptions]);

  const handleItemSelect = (item: MenuItem) => {
    const itemGroups = modifierGroups.filter((group) =>
      item.modifierGroupIds?.includes(group.id)
    );

    // If item has no modifier groups, add directly
    if (itemGroups.length === 0) {
      onSubmit({
        itemName: item.name,
        itemCategory: item.category,
        customizations: {},
        notes: '',
      });
      return;
    }

    setSelectedItem(item);

    // Set defaults for required single-select groups
    const defaults: OrderCustomizations = {};
    itemGroups.forEach((group) => {
      if (group.required && !group.multiSelect) {
        const firstOption = group.options.find((opt) => opt.available);
        if (firstOption) {
          defaults[group.id] = [firstOption.name];
        }
      }
    });
    setSelectedOptions(defaults);
    setNotes('');
  };

  const handleSingleSelect = (groupId: string, optionName: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupId]: [optionName],
    }));
  };

  const handleMultiSelect = (groupId: string, optionName: string) => {
    setSelectedOptions((prev) => {
      const current = prev[groupId] || [];
      const isSelected = current.includes(optionName);

      return {
        ...prev,
        [groupId]: isSelected
          ? current.filter((name) => name !== optionName)
          : [...current, optionName],
      };
    });
  };

  const handleSubmit = () => {
    if (!selectedItem) return;

    onSubmit({
      itemName: selectedItem.name,
      itemCategory: selectedItem.category,
      customizations: selectedOptions,
      notes,
    });

    setSelectedItem(null);
    setSelectedOptions({});
    setNotes('');
  };

  const handleQuickAdd = (item: MenuItem) => {
    const itemGroups = modifierGroups.filter((group) =>
      item.modifierGroupIds?.includes(group.id)
    );

    // Build default selections for quick add
    const defaults: OrderCustomizations = {};
    itemGroups.forEach((group) => {
      if (group.required && !group.multiSelect) {
        const firstOption = group.options.find((opt) => opt.available);
        if (firstOption) {
          defaults[group.id] = [firstOption.name];
        }
      }
    });

    onSubmit({
      itemName: item.name,
      itemCategory: item.category,
      customizations: defaults,
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
              <div className="grid grid-cols-1 gap-2">
                {categoryItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemSelect(item)}
                    onDoubleClick={() => handleQuickAdd(item)}
                    className="group relative rounded-lg border border-oat-200 bg-white p-5 text-left transition-all hover:border-terracotta hover:shadow-warm active:bg-oat-50"
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
            {itemModifierGroups.map((group) => (
              <ModifierGroupSelector
                key={group.id}
                group={group}
                selected={selectedOptions[group.id] || []}
                onSingleSelect={(name) => handleSingleSelect(group.id, name)}
                onMultiSelect={(name) => handleMultiSelect(group.id, name)}
              />
            ))}

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
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!hasAllRequired}
            >
              Add Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ModifierGroupSelectorProps {
  group: ModifierGroup;
  selected: string[];
  onSingleSelect: (optionName: string) => void;
  onMultiSelect: (optionName: string) => void;
}

function ModifierGroupSelector({
  group,
  selected,
  onSingleSelect,
  onMultiSelect,
}: ModifierGroupSelectorProps) {
  const availableOptions = group.options.filter((opt) => opt.available);

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <label className="text-sm font-medium text-espresso">{group.name}</label>
        {group.required && (
          <span className="text-xs text-terracotta">Required</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {availableOptions.map((option) => {
          const isSelected = selected.includes(option.name);

          if (group.multiSelect) {
            // Multi-select: toggle chips
            return (
              <button
                key={option.id}
                onClick={() => onMultiSelect(option.name)}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm transition-colors active:scale-95',
                  isSelected
                    ? 'border-terracotta bg-terracotta/10 text-terracotta'
                    : 'border-oat-200 bg-white text-espresso hover:border-oat-300'
                )}
              >
                {option.name}
              </button>
            );
          }

          // Single-select: tab-style buttons
          return (
            <button
              key={option.id}
              onClick={() => onSingleSelect(option.name)}
              className={cn(
                'rounded-lg border px-4 py-2.5 text-sm transition-colors active:scale-95',
                isSelected
                  ? 'border-terracotta bg-terracotta text-white'
                  : 'border-oat-200 bg-white text-espresso hover:border-oat-300'
              )}
            >
              {option.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
