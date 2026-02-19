import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] md:text-sm',
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      style={{
        color: 'var(--primary-text-color)',
        borderColor: 'var(--ui-border-color)',
        // @ts-expect-error CSS custom property placeholder
        '--tw-ring-color': 'var(--primary-color)',
      }}
      {...props}
    />
  );
}

export { Input };
