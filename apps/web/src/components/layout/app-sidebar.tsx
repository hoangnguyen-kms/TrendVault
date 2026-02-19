import { Link, useLocation } from 'react-router';
import { Icon } from '@vibe/core';
import { Dashboard, Activity, Download, Upload, Chart, Settings } from '@vibe/icons';
import { cn } from '@/lib/utils';

function TvIcon({ className }: { className?: string }) {
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
      <rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
      <polyline points="17 2 12 7 7 2" />
    </svg>
  );
}

type NavIcon = typeof Dashboard;

interface NavItem {
  name: string;
  href: string;
  vibeIcon?: NavIcon;
  customIcon?: typeof TvIcon;
  disabled: boolean;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', vibeIcon: Dashboard, disabled: false },
  { name: 'Trending', href: '/trending', vibeIcon: Activity, disabled: false },
  { name: 'Downloads', href: '/downloads', vibeIcon: Download, disabled: false },
  { name: 'Uploads', href: '/uploads', vibeIcon: Upload, disabled: false },
  { name: 'Channels', href: '/channels', customIcon: TvIcon, disabled: false },
  { name: 'Analytics', href: '/analytics', vibeIcon: Chart, disabled: false },
  { name: 'Settings', href: '/settings', vibeIcon: Settings, disabled: false },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside
      className="flex w-64 flex-col border-r"
      style={{
        backgroundColor: 'var(--primary-background-color)',
        borderColor: 'var(--layout-border-color)',
      }}
    >
      <div
        className="flex h-16 items-center border-b px-6"
        style={{ borderColor: 'var(--layout-border-color)' }}
      >
        <div className="flex items-center gap-2">
          <Icon icon={Activity} iconSize={24} style={{ color: 'var(--primary-color)' }} />
          <span style={{ font: 'var(--font-h3-bold)', color: 'var(--primary-text-color)' }}>
            TrendVault
          </span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                item.disabled && 'cursor-not-allowed opacity-50 pointer-events-none',
              )}
              style={{
                font: 'var(--font-text2-medium)',
                ...(isActive
                  ? {
                      backgroundColor: 'var(--primary-selected-color)',
                      color: 'var(--primary-color)',
                    }
                  : {
                      color: 'var(--secondary-text-color)',
                    }),
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    'var(--primary-background-hover-color)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
                }
              }}
              aria-disabled={item.disabled}
            >
              {item.vibeIcon ? (
                <Icon icon={item.vibeIcon} iconSize={20} />
              ) : item.customIcon ? (
                <item.customIcon />
              ) : null}
              {item.name}
              {item.disabled && (
                <span
                  className="ml-auto"
                  style={{ font: 'var(--font-text3-normal)', color: 'var(--disabled-text-color)' }}
                >
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
