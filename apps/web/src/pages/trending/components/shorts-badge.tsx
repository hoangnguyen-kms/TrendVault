import { cn } from '@/lib/utils';

export function ShortsBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider',
        className,
      )}
    >
      Short
    </span>
  );
}
