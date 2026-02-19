import * as React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Context                                                           */
/* ------------------------------------------------------------------ */

interface SelectContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  value: string;
  onValueChange: (v: string) => void;
  /** Map value -> rendered label text */
  registerItem: (value: string, label: string) => void;
  selectedLabel: string;
}

const SelectCtx = createContext<SelectContextValue | null>(null);

function useSelectCtx() {
  const ctx = useContext(SelectCtx);
  if (!ctx) throw new Error('Select compound components must be used within <Select>');
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Select (root provider)                                            */
/* ------------------------------------------------------------------ */

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

function Select({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  children,
}: SelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [labels, setLabels] = useState<Record<string, string>>({});

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleValueChange = useCallback(
    (v: string) => {
      if (controlledValue === undefined) setInternalValue(v);
      onValueChange?.(v);
    },
    [controlledValue, onValueChange],
  );

  const registerItem = useCallback((itemValue: string, label: string) => {
    setLabels((prev) => {
      if (prev[itemValue] === label) return prev;
      return { ...prev, [itemValue]: label };
    });
  }, []);

  const selectedLabel = labels[value] ?? '';

  const ctx = useMemo(
    () => ({ open, setOpen, value, onValueChange: handleValueChange, registerItem, selectedLabel }),
    [open, value, handleValueChange, registerItem, selectedLabel],
  );

  return (
    <SelectCtx.Provider value={ctx}>
      <div data-slot="select" className="relative inline-block">
        {children}
      </div>
    </SelectCtx.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  SelectTrigger                                                     */
/* ------------------------------------------------------------------ */

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'default';
}

function SelectTrigger({ className, size = 'default', children, ...props }: SelectTriggerProps) {
  const { open, setOpen } = useSelectCtx();

  return (
    <button
      type="button"
      data-slot="select-trigger"
      data-size={size}
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className={cn(
        'flex w-fit items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50',
        'data-[size=default]:h-9 data-[size=sm]:h-8',
        className,
      )}
      style={{
        backgroundColor: 'var(--primary-background-color)',
        borderColor: 'var(--ui-border-color)',
        color: 'var(--primary-text-color)',
      }}
      {...props}
    >
      {children}
      {/* Chevron down via CSS triangle */}
      <span
        aria-hidden
        className="ml-1 shrink-0 opacity-50"
        style={{
          display: 'inline-block',
          width: 0,
          height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: '5px solid currentColor',
        }}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  SelectValue                                                       */
/* ------------------------------------------------------------------ */

interface SelectValueProps {
  placeholder?: string;
}

function SelectValue({ placeholder }: SelectValueProps) {
  const { selectedLabel, value } = useSelectCtx();
  const display = selectedLabel || value;

  return (
    <span
      data-slot="select-value"
      className="line-clamp-1 flex items-center gap-2"
      style={{ color: display ? undefined : 'var(--secondary-text-color)' }}
    >
      {display || placeholder || ''}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  SelectContent                                                     */
/* ------------------------------------------------------------------ */

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: string;
  align?: string;
}

function SelectContent({ className, children, ...props }: SelectContentProps) {
  const { open, setOpen } = useSelectCtx();
  const contentRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, setOpen]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.closest('[data-slot="select"]')?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      data-slot="select-content"
      className={cn(
        'absolute z-50 mt-1 min-w-[8rem] w-full overflow-y-auto rounded-md border p-1',
        className,
      )}
      style={{
        backgroundColor: 'var(--primary-background-color)',
        borderColor: 'var(--ui-border-color)',
        boxShadow: 'var(--box-shadow-small)',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SelectItem                                                        */
/* ------------------------------------------------------------------ */

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

function SelectItem({
  className,
  value: itemValue,
  children,
  disabled,
  ...props
}: SelectItemProps) {
  const { value, onValueChange, setOpen, registerItem } = useSelectCtx();
  const isSelected = value === itemValue;
  const label = typeof children === 'string' ? children : '';

  // Register this item's label so SelectValue can display it
  useEffect(() => {
    registerItem(itemValue, label);
  }, [itemValue, label, registerItem]);

  return (
    <div
      role="option"
      aria-selected={isSelected}
      data-slot="select-item"
      data-disabled={disabled || undefined}
      className={cn(
        'relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
      style={{ color: 'var(--primary-text-color)' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor =
          'var(--primary-background-hover-color)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
      }}
      onClick={() => {
        if (disabled) return;
        onValueChange(itemValue);
        setOpen(false);
      }}
      {...props}
    >
      <span className="flex-1">{children}</span>
      {isSelected && (
        <span className="absolute right-2 flex size-3.5 items-center justify-center text-xs">
          {/* Check character */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M11.5 3.5L5.5 10L2.5 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pass-through / no-op exports for backward compat                  */
/* ------------------------------------------------------------------ */

function SelectGroup({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="select-group" role="group" {...props}>
      {children}
    </div>
  );
}

function SelectLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="select-label"
      className={cn('px-2 py-1.5 text-xs', className)}
      style={{ color: 'var(--secondary-text-color)' }}
      {...props}
    />
  );
}

function SelectSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="select-separator"
      className={cn('pointer-events-none -mx-1 my-1 h-px', className)}
      style={{ backgroundColor: 'var(--ui-border-color)' }}
      {...props}
    />
  );
}

function SelectScrollUpButton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="select-scroll-up-button"
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    />
  );
}

function SelectScrollDownButton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="select-scroll-down-button"
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Exports                                                           */
/* ------------------------------------------------------------------ */

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
