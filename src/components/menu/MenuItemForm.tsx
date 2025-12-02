import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { MenuItem, ModifierGroup, NewMenuItem } from '@/db/types';

interface MenuItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: MenuItem | null;
  modifierGroups: ModifierGroup[];
  onSubmit: (data: NewMenuItem) => void;
}

export function MenuItemForm({
  open,
  onOpenChange,
  item,
  modifierGroups,
  onSubmit,
}: MenuItemFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MenuItem['category']>('espresso');
  const [baseCost, setBaseCost] = useState('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setBaseCost(item.baseCost?.toString() ?? '');
      setSelectedGroupIds(item.modifierGroupIds || []);
    } else {
      setName('');
      setCategory('espresso');
      setBaseCost('');
      setSelectedGroupIds([]);
    }
  }, [item, open]);

  const handleToggleGroup = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      category,
      baseCost: baseCost ? parseFloat(baseCost) : undefined,
      modifierGroupIds: selectedGroupIds,
      available: item?.available ?? true,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Item' : 'Add Menu Item'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cappuccino"
              autoComplete="off"
              autoCorrect="off"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as MenuItem['category'])}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="espresso">Espresso</SelectItem>
                <SelectItem value="drip">Drip</SelectItem>
                <SelectItem value="tea">Tea</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="baseCost">Base Cost (optional)</Label>
            <Input
              id="baseCost"
              type="number"
              step="0.01"
              min="0"
              value={baseCost}
              onChange={(e) => setBaseCost(e.target.value)}
              placeholder="3.50"
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-oat-500">
              For future cost tracking
            </p>
          </div>

          {modifierGroups.length > 0 && (
            <div>
              <Label>Modifier Groups</Label>
              <p className="mb-2 text-xs text-oat-500">
                Select which customizations apply to this item
              </p>
              <div className="space-y-2">
                {modifierGroups.map((group) => (
                  <label
                    key={group.id}
                    className="flex items-center gap-3 rounded-lg border border-oat-200 bg-oat-50 px-3 py-2 cursor-pointer hover:bg-oat-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGroupIds.includes(group.id)}
                      onChange={() => handleToggleGroup(group.id)}
                      className="h-4 w-4 rounded border-oat-300 text-terracotta focus:ring-terracotta"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-espresso">
                        {group.name}
                      </span>
                      <span className="ml-2 text-xs text-oat-500">
                        ({group.options.filter((o) => o.available).length} options)
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {group.multiSelect && (
                        <span className="rounded-full bg-oat-200 px-1.5 py-0.5 text-[10px] text-oat-600">
                          Multi
                        </span>
                      )}
                      {group.required && (
                        <span className="rounded-full bg-terracotta/10 px-1.5 py-0.5 text-[10px] text-terracotta">
                          Required
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {item ? 'Save Changes' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

