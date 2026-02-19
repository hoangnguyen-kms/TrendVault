import { cn } from '@/lib/utils';

export function ShortsBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-1.5 py-0.5 uppercase tracking-wider',
        className,
      )}
      style={{
        backgroundColor: '#dc2626',
        color: '#ffffff',
        font: 'var(--font-text3-normal)',
        fontSize: '10px',
        fontWeight: 700,
      }}
    >
      Short
    </span>
  );
}
