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
import type { MenuItem } from '@/db/types';

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onToggleAvailable: (id: string, available: boolean) => void;
  showDragHandle?: boolean;
}

export function MenuItemCard({
  item,
  onEdit,
  onDelete,
  onToggleAvailable,
  showDragHandle = false,
}: MenuItemCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border bg-white p-3 transition-opacity',
        !item.available && 'border-dashed opacity-60'
      )}
    >
      {showDragHandle && <DragHandle />}
      <div className="flex-1">
        <span className="font-medium text-espresso">{item.name}</span>
        {item.baseCost !== undefined && (
          <span className="ml-2 text-sm text-oat-500">
            ${item.baseCost.toFixed(2)}
          </span>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4 text-oat-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(item)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onToggleAvailable(item.id, !item.available)}
          >
            {item.available ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide from menu
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show on menu
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

