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
import type { MenuItem, NewMenuItem } from '@/db/types';

interface MenuItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: MenuItem | null;
  onSubmit: (data: NewMenuItem) => void;
}

export function MenuItemForm({
  open,
  onOpenChange,
  item,
  onSubmit,
}: MenuItemFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MenuItem['category']>('espresso');
  const [baseCost, setBaseCost] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setBaseCost(item.baseCost?.toString() ?? '');
    } else {
      setName('');
      setCategory('espresso');
      setBaseCost('');
    }
  }, [item, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      category,
      baseCost: baseCost ? parseFloat(baseCost) : undefined,
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
