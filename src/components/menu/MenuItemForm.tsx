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
import type { MenuItem, ModifierGroup, Category, NewMenuItem } from '@/db/types';

interface MenuItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: MenuItem | null;
  modifierGroups: ModifierGroup[];
  categories: Category[];
  onSubmit: (data: NewMenuItem) => void;
}

export function MenuItemForm({
  open,
  onOpenChange,
  item,
  modifierGroups,
  categories,
  onSubmit,
}: MenuItemFormProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [baseCost, setBaseCost] = useState('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  // Set default category on first load or when categories change
  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategoryId(item.categoryId);
      setBaseCost(item.baseCost?.toString() ?? '');
      setSelectedGroupIds(item.modifierGroupIds || []);
    } else {
      setName('');
      // Default to first available category
      setCategoryId(categories.find(c => c.available)?.id || categories[0]?.id || '');
      setBaseCost('');
      setSelectedGroupIds([]);
    }
  }, [item, open, categories]);

  const handleToggleGroup = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;

    onSubmit({
      name: name.trim(),
      categoryId,
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
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
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
            <p className="mt-1 text-xs text-muted-foreground">
              For future cost tracking
            </p>
          </div>

          {modifierGroups.length > 0 && (
            <div>
              <Label>Modifier Groups</Label>
              <p className="mb-2 text-xs text-muted-foreground">
                Select which customizations apply to this item
              </p>
              <div className="space-y-2">
                {modifierGroups.map((group) => (
                  <label
                    key={group.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-secondary px-3 py-2 cursor-pointer hover:bg-secondary/80 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGroupIds.includes(group.id)}
                      onChange={() => handleToggleGroup(group.id)}
                      className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">
                        {group.name}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({group.options.filter((o) => o.available).length} options)
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {group.multiSelect && (
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
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

