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
import type { Category } from '@/db/types';

interface CategoryCardProps {
  category: Category;
  itemCount: number;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleAvailable: (id: string, available: boolean) => void;
  showDragHandle?: boolean;
}

export function CategoryCard({
  category,
  itemCount,
  onEdit,
  onDelete,
  onToggleAvailable,
  showDragHandle = false,
}: CategoryCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border bg-white p-3 transition-opacity',
        !category.available && 'border-dashed opacity-60'
      )}
    >
      {showDragHandle && <DragHandle />}
      <div className="flex flex-1 items-center gap-2">
        <span className="font-medium text-espresso">{category.name}</span>
        <span className="rounded-full bg-oat-100 px-2 py-0.5 text-xs text-oat-600">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4 text-oat-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(category)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onToggleAvailable(category.id, !category.available)}
          >
            {category.available ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide category
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show category
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => onDelete(category.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
