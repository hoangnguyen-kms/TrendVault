import * as React from 'react';

import { cn } from '@/lib/utils';

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn(
        'leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      style={{ color: 'var(--primary-text-color)', font: 'var(--font-text2-medium)' }}
      {...props}
    />
  );
}

export { Label };
