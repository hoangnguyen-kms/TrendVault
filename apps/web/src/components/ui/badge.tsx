import * as React from 'react';

import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Variant style maps using Vibe CSS tokens                          */
/* ------------------------------------------------------------------ */

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: 'var(--primary-color)',
    color: 'var(--text-color-on-primary)',
  },
  secondary: {
    backgroundColor: 'var(--secondary-background-color)',
    color: 'var(--primary-text-color)',
  },
  destructive: {
    backgroundColor: 'var(--negative-color)',
    color: 'var(--text-color-on-primary)',
  },
  outline: {
    borderColor: 'var(--ui-border-color)',
    color: 'var(--primary-text-color)',
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--primary-text-color)',
  },
  link: {
    backgroundColor: 'transparent',
    color: 'var(--primary-color)',
  },
};

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';

/* ------------------------------------------------------------------ */
/*  No-op badgeVariants for backward compat                           */
/* ------------------------------------------------------------------ */

function badgeVariants(_props?: { variant?: BadgeVariant }) {
  return '';
}

/* ------------------------------------------------------------------ */
/*  Badge                                                             */
/* ------------------------------------------------------------------ */

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  asChild?: boolean;
}

function Badge({ className, variant = 'default', asChild: _asChild, style, ...props }: BadgeProps) {
  const needsBorder = variant === 'outline';

  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(
        'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 overflow-hidden transition-colors',
        needsBorder && 'border',
        variant === 'link' && 'underline-offset-4 hover:underline',
        className,
      )}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
export type { BadgeVariant, BadgeProps };
