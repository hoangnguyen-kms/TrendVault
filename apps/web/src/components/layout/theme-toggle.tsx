import { useState } from 'react';
import { Icon } from '@vibe/core';
import { Sun, Moon } from '@vibe/icons';
import { useThemeStore } from '@/stores/theme-store';

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  );
}

type ThemeValue = 'light' | 'dark' | 'system';

interface ThemeOption {
  value: ThemeValue;
  label: string;
  vibeIcon?: typeof Sun;
  customIcon?: typeof MonitorIcon;
}

const options: ThemeOption[] = [
  { value: 'light', label: 'Light', vibeIcon: Sun },
  { value: 'dark', label: 'Dark', vibeIcon: Moon },
  { value: 'system', label: 'System', customIcon: MonitorIcon },
];

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);

  const activeOption = options.find((o) => o.value === theme) ?? options[2];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
        style={{ color: 'var(--icon-color)' }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            'var(--primary-background-hover-color)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
        }}
        aria-label="Toggle theme"
      >
        {activeOption.vibeIcon ? (
          <Icon icon={activeOption.vibeIcon} iconSize={20} />
        ) : activeOption.customIcon ? (
          <activeOption.customIcon />
        ) : null}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div
            className="absolute right-0 z-20 mt-2 w-36 rounded-lg border"
            style={{
              backgroundColor: 'var(--primary-background-color)',
              borderColor: 'var(--ui-border-color)',
              boxShadow: 'var(--box-shadow-medium)',
            }}
          >
            <div className="p-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 transition-colors"
                  style={{
                    font: 'var(--font-text2-normal)',
                    ...(theme === option.value
                      ? {
                          backgroundColor: 'var(--primary-selected-color)',
                          color: 'var(--primary-color)',
                        }
                      : {
                          color: 'var(--primary-text-color)',
                        }),
                  }}
                  onMouseEnter={(e) => {
                    if (theme !== option.value) {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                        'var(--primary-background-hover-color)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (theme !== option.value) {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {option.vibeIcon ? (
                    <Icon icon={option.vibeIcon} iconSize={16} />
                  ) : option.customIcon ? (
                    <option.customIcon className="h-4 w-4" />
                  ) : null}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
