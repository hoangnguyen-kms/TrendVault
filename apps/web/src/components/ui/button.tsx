import * as React from 'react';
import { Button as VibeButton, type ButtonProps as VibeButtonProps } from '@vibe/core';

import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';

interface ButtonProps extends Omit<React.ComponentProps<'button'>, 'color' | 'type'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const VARIANT_MAP: Record<
  ButtonVariant,
  { kind: VibeButtonProps['kind']; color?: VibeButtonProps['color'] }
> = {
  default: { kind: 'primary' },
  destructive: { kind: 'primary', color: 'negative' },
  outline: { kind: 'secondary' },
  secondary: { kind: 'secondary' },
  ghost: { kind: 'tertiary' },
  link: { kind: 'tertiary' },
};

const SIZE_MAP: Record<ButtonSize, { vibeSize: VibeButtonProps['size']; extraClass?: string }> = {
  default: { vibeSize: 'medium' },
  xs: { vibeSize: 'small', extraClass: 'px-2 py-0.5 text-xs' },
  sm: { vibeSize: 'small' },
  lg: { vibeSize: 'large' },
  icon: { vibeSize: 'medium', extraClass: 'size-9 p-0' },
  'icon-xs': { vibeSize: 'small', extraClass: 'size-6 p-0 [&_svg]:size-3' },
  'icon-sm': { vibeSize: 'small', extraClass: 'size-8 p-0' },
  'icon-lg': { vibeSize: 'large', extraClass: 'size-10 p-0' },
};

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild: _asChild,
  type = 'button',
  disabled,
  onClick,
  children,
  ...props
}: ButtonProps) {
  const { kind, color } = VARIANT_MAP[variant];
  const { vibeSize, extraClass } = SIZE_MAP[size];

  const linkClass = variant === 'link' ? 'underline-offset-4 hover:underline' : '';

  return (
    <VibeButton
      kind={kind}
      color={color}
      size={vibeSize}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(linkClass, extraClass, className)}
      {...props}
    >
      {children}
    </VibeButton>
  );
}

/** @deprecated No longer uses CVA -- kept for backward compatibility */
const buttonVariants = (_opts?: Record<string, unknown>) => '';

export { Button, buttonVariants };
export type { ButtonProps };
