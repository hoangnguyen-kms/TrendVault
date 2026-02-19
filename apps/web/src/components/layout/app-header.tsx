import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Icon } from '@vibe/core';
import { LogOut, Person } from '@vibe/icons';
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
    <header
      className="flex h-16 items-center justify-between border-b px-6"
      style={{
        backgroundColor: 'var(--primary-background-color)',
        borderColor: 'var(--layout-border-color)',
      }}
    >
      <div>
        <h1 style={{ font: 'var(--font-h3-bold)', color: 'var(--primary-text-color)' }}>
          Dashboard
        </h1>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors"
          style={{ color: 'var(--primary-text-color)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'var(--primary-background-hover-color)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
          }}
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{
              backgroundColor: 'var(--primary-color)',
              color: 'var(--text-color-on-primary)',
            }}
          >
            <Icon icon={Person} iconSize={16} />
          </div>
          <div className="text-left">
            <div style={{ font: 'var(--font-text2-medium)', color: 'var(--primary-text-color)' }}>
              {user?.name}
            </div>
            <div style={{ font: 'var(--font-text3-normal)', color: 'var(--secondary-text-color)' }}>
              {user?.email}
            </div>
          </div>
        </button>

        {isMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
            <div
              className="absolute right-0 z-20 mt-2 w-56 rounded-lg border"
              style={{
                backgroundColor: 'var(--primary-background-color)',
                borderColor: 'var(--ui-border-color)',
                boxShadow: 'var(--box-shadow-medium)',
              }}
            >
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 transition-colors disabled:opacity-50"
                  style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      'var(--primary-background-hover-color)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                  }}
                >
                  <Icon icon={LogOut} iconSize={16} />
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
