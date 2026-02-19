import * as React from 'react';
import { Toggle } from '@vibe/core';

import { cn } from '@/lib/utils';

interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  name?: string;
  'aria-label'?: string;
}

const handleChange = (onCheckedChange?: (checked: boolean) => void) => {
  return (val: boolean) => onCheckedChange?.(val);
};

function Switch({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  id,
  className,
  name,
  'aria-label': ariaLabel,
}: SwitchProps) {
  return (
    <Toggle
      isSelected={checked}
      isDefaultSelected={defaultChecked}
      onChange={handleChange(onCheckedChange)}
      disabled={disabled}
      id={id}
      name={name}
      className={cn(className)}
      areLabelsHidden
      size="small"
      ariaLabel={ariaLabel}
      data-slot="switch"
    />
  );
}

export { Switch };
export type { SwitchProps };
