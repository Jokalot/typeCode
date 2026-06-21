import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className }: ProgressProps) {
  return (
    <div className={cn('w-full bg-muted rounded-full overflow-hidden', className)}>
      <div
        className="h-full bg-primary rounded-full transition-all duration-100"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
