import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

function Card({ className, style, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn('flex flex-col gap-6 rounded-xl py-6', className)}
      style={{
        backgroundColor: 'var(--primary-background-color)',
        color: 'var(--primary-text-color)',
        border: '1px solid var(--ui-border-color)',
        boxShadow: 'var(--box-shadow-xs)',
        ...style,
      }}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]',
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, style, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none', className)}
      style={{ font: 'var(--font-text1-bold)', ...style }}
      {...props}
    />
  );
}

function CardDescription({ className, style, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn(className)}
      style={{ color: 'var(--secondary-text-color)', font: 'var(--font-text2-normal)', ...style }}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-6', className)} {...props} />;
}

function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div data-slot="card-footer" className={cn('flex items-center px-6', className)} {...props} />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
