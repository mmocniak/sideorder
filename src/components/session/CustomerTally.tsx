import { Minus, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomerTallyProps {
  count: number;
  onChange: (count: number) => void;
}

export function CustomerTally({ count, onChange }: CustomerTallyProps) {
  const handleDecrement = () => {
    if (count > 0) {
      onChange(count - 1);
    }
  };

  const handleIncrement = () => {
    onChange(count + 1);
  };

  return (
    <div className="rounded-xl bg-card p-3 shadow-warm">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        Customers
      </div>
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-lg border-2 text-muted-foreground hover:border-primary hover:text-primary active:scale-95"
          onClick={handleDecrement}
          disabled={count === 0}
        >
          <Minus className="h-5 w-5" />
        </Button>
        <span className="min-w-[3rem] text-center font-display text-2xl font-bold text-foreground">
          {count}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-lg border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground active:scale-95"
          onClick={handleIncrement}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
