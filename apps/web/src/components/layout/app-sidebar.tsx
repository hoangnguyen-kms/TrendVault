import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  TrendingUp,
  Download,
  Upload,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, disabled: false },
  { name: 'Trending', href: '/trending', icon: TrendingUp, disabled: true },
  { name: 'Downloads', href: '/downloads', icon: Download, disabled: true },
  { name: 'Uploads', href: '/uploads', icon: Upload, disabled: true },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, disabled: true },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="flex w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold">TrendVault</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                item.disabled &&
                  'cursor-not-allowed opacity-50 pointer-events-none',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
              aria-disabled={item.disabled}
            >
              <Icon className="h-5 w-5" />
              {item.name}
              {item.disabled && (
                <span className="ml-auto text-xs text-gray-400">Soon</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
