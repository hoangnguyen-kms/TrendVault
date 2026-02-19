import * as React from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Context                                                           */
/* ------------------------------------------------------------------ */

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
  orientation: 'horizontal' | 'vertical';
}

const TabsCtx = createContext<TabsContextValue | null>(null);

function useTabsCtx() {
  const ctx = useContext(TabsCtx);
  if (!ctx) throw new Error('Tabs compound components must be used within <Tabs>');
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Tabs (root provider)                                              */
/* ------------------------------------------------------------------ */

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
}

function Tabs({
  className,
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  orientation = 'horizontal',
  children,
  ...props
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeTab = controlledValue !== undefined ? controlledValue : internalValue;

  const setActiveTab = useCallback(
    (v: string) => {
      if (controlledValue === undefined) setInternalValue(v);
      onValueChange?.(v);
    },
    [controlledValue, onValueChange],
  );

  const ctx = useMemo(
    () => ({ activeTab, setActiveTab, orientation }),
    [activeTab, setActiveTab, orientation],
  );

  return (
    <TabsCtx.Provider value={ctx}>
      <div
        data-slot="tabs"
        data-orientation={orientation}
        className={cn(
          'flex gap-2',
          orientation === 'horizontal' ? 'flex-col' : 'flex-row',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </TabsCtx.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  TabsList                                                          */
/* ------------------------------------------------------------------ */

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'line';
}

function TabsList({ className, variant = 'default', children, ...props }: TabsListProps) {
  const { orientation } = useTabsCtx();

  return (
    <div
      data-slot="tabs-list"
      data-variant={variant}
      role="tablist"
      className={cn(
        'inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-sm',
        orientation === 'horizontal' ? 'h-9' : 'h-fit flex-col',
        variant === 'default' ? '' : 'gap-1 rounded-none bg-transparent',
        className,
      )}
      style={
        variant === 'default' ? { backgroundColor: 'var(--allgrey-background-color)' } : undefined
      }
      {...props}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TabsTrigger                                                       */
/* ------------------------------------------------------------------ */

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

function TabsTrigger({ className, value, children, ...props }: TabsTriggerProps) {
  const { activeTab, setActiveTab, orientation } = useTabsCtx();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      data-slot="tabs-trigger"
      data-state={isActive ? 'active' : 'inactive'}
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={cn(
        'relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-all outline-none disabled:pointer-events-none disabled:opacity-50',
        orientation === 'vertical' && 'w-full justify-start',
        className,
      )}
      style={{
        color: isActive ? 'var(--primary-text-color)' : 'var(--secondary-text-color)',
        backgroundColor: isActive ? 'var(--primary-background-color)' : 'transparent',
        boxShadow: isActive ? 'var(--box-shadow-xs)' : 'none',
      }}
      {...props}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  TabsContent                                                       */
/* ------------------------------------------------------------------ */

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

function TabsContent({ className, value, children, ...props }: TabsContentProps) {
  const { activeTab } = useTabsCtx();

  if (activeTab !== value) return null;

  return (
    <div
      data-slot="tabs-content"
      role="tabpanel"
      className={cn('flex-1 outline-none', className)}
      {...props}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Backward compat export                                            */
/* ------------------------------------------------------------------ */

// No-op function for backward compatibility with CVA-based tabsListVariants
function tabsListVariants(_props?: { variant?: 'default' | 'line' }) {
  return '';
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
