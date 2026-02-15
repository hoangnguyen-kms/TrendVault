import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useCurrentUser, useLogout } from '@/hooks/use-auth';

export function AppHeader() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-gray-900">{user?.name}</div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
        </button>

        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border bg-white shadow-lg">
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {logout.isPending ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
