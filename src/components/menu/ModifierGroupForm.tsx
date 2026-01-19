import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { generateId } from '@/lib/utils';
import type { ModifierGroup, ModifierOption, NewModifierGroup } from '@/db/types';

interface ModifierGroupFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: ModifierGroup | null;
  onSubmit: (data: NewModifierGroup) => void;
}

export function ModifierGroupForm({
  open,
  onOpenChange,
  group,
  onSubmit,
}: ModifierGroupFormProps) {
  const [name, setName] = useState('');
  const [multiSelect, setMultiSelect] = useState(false);
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState<ModifierOption[]>([]);
  const [newOptionName, setNewOptionName] = useState('');

  useEffect(() => {
    if (group) {
      setName(group.name);
      setMultiSelect(group.multiSelect);
      setRequired(group.required);
      setOptions(group.options);
    } else {
      setName('');
      setMultiSelect(false);
      setRequired(false);
      setOptions([]);
    }
    setNewOptionName('');
  }, [group, open]);

  const handleAddOption = () => {
    if (!newOptionName.trim()) return;

    const newOption: ModifierOption = {
      id: generateId(),
      name: newOptionName.trim(),
      available: true,
    };
    setOptions([...options, newOption]);
    setNewOptionName('');
  };

  const handleRemoveOption = (id: string) => {
    setOptions(options.filter((opt) => opt.id !== id));
  };

  const handleToggleOptionAvailable = (id: string) => {
    setOptions(
      options.map((opt) =>
        opt.id === id ? { ...opt, available: !opt.available } : opt
      )
    );
  };

  const handleUpdateOptionPrice = (id: string, price: string) => {
    const numValue = parseFloat(price);
    setOptions(
      options.map((opt) =>
        opt.id === id
          ? { ...opt, priceAdditive: price === '' ? undefined : (isNaN(numValue) ? opt.priceAdditive : numValue) }
          : opt
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || options.length === 0) return;

    onSubmit({
      name: name.trim(),
      options,
      multiSelect,
      required,
      available: group?.available ?? true,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {group ? 'Edit Modifier Group' : 'Add Modifier Group'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Milk, Size, Flavor Syrups"
              className="mt-1.5"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={multiSelect}
                onChange={(e) => setMultiSelect(e.target.checked)}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-sm text-foreground">Allow multiple selections</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-sm text-foreground">Required</span>
            </label>
          </div>

          <div>
            <Label>Options</Label>
            <div className="mt-1.5 space-y-2">
              {options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2"
                >
                  <span
                    className={`flex-1 text-sm ${
                      option.available ? 'text-foreground' : 'text-muted-foreground line-through'
                    }`}
                  >
                    {option.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">+$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={option.priceAdditive ?? ''}
                      onChange={(e) => handleUpdateOptionPrice(option.id, e.target.value)}
                      placeholder="0.00"
                      className="w-16 rounded border border-border bg-card px-1.5 py-0.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleOptionAvailable(option.id)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {option.available ? 'Hide' : 'Show'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(option.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <div className="flex gap-2">
                <Input
                  value={newOptionName}
                  onChange={(e) => setNewOptionName(e.target.value)}
                  placeholder="Add option..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddOption}
                  disabled={!newOptionName.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {options.length === 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Add at least one option
              </p>
            )}
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
            <Button
              type="submit"
              className="flex-1"
              disabled={!name.trim() || options.length === 0}
            >
              {group ? 'Save Changes' : 'Add Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
