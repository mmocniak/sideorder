import { MoreVertical, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DragHandle } from '@/components/ui/sortable-list';
import { cn } from '@/lib/utils';
import type { ModifierGroup } from '@/db/types';

interface ModifierGroupCardProps {
  group: ModifierGroup;
  onEdit: (group: ModifierGroup) => void;
  onDelete: (id: string) => void;
  onToggleAvailable: (id: string, available: boolean) => void;
  showDragHandle?: boolean;
}

export function ModifierGroupCard({
  group,
  onEdit,
  onDelete,
  onToggleAvailable,
  showDragHandle = false,
}: ModifierGroupCardProps) {
  const availableOptions = group.options.filter((opt) => opt.available);

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 transition-opacity',
        !group.available && 'border-dashed opacity-60'
      )}
    >
      <div className="flex items-start gap-2">
        {showDragHandle && <DragHandle className="mt-0.5" />}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{group.name}</span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              {group.multiSelect ? 'Multi' : 'Single'}
            </span>
            {group.required && (
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">
                Required
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {availableOptions.map((option) => (
              <span
                key={option.id}
                className="rounded-md border border-border bg-muted px-2 py-0.5 text-sm text-foreground"
              >
                {option.name}
                {option.priceAdditive != null && option.priceAdditive > 0 && (
                  <span className="ml-1 text-muted-foreground">(+${option.priceAdditive.toFixed(2)})</span>
                )}
              </span>
            ))}
            {availableOptions.length === 0 && (
              <span className="text-sm text-muted-foreground">No options</span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(group)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onToggleAvailable(group.id, !group.available)}
            >
              {group.available ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Hide group
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Show group
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(group.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
