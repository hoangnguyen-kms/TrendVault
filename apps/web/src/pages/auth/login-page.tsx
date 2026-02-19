import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Icon } from '@vibe/core';
import { Activity } from '@vibe/icons';
import { useLogin } from '@/hooks/use-auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login.mutateAsync({ email, password });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: 'var(--allgrey-background-color)' }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <Icon icon={Activity} iconSize={32} style={{ color: 'var(--primary-color)' }} />
            <span style={{ font: 'var(--font-h2-bold)', color: 'var(--primary-text-color)' }}>
              TrendVault
            </span>
          </div>
          <h2 style={{ font: 'var(--font-h3-bold)', color: 'var(--primary-text-color)' }}>
            Sign in to your account
          </h2>
        </div>

        <div
          className="rounded-lg border p-8"
          style={{
            backgroundColor: 'var(--primary-background-color)',
            borderColor: 'var(--ui-border-color)',
            boxShadow: 'var(--box-shadow-xs)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div
                className="rounded-md border p-3"
                style={{
                  backgroundColor: 'var(--negative-color-selected)',
                  borderColor: 'var(--negative-color)',
                }}
              >
                <p style={{ font: 'var(--font-text2-normal)', color: 'var(--negative-color)' }}>
                  {error}
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block"
                style={{ font: 'var(--font-text2-medium)', color: 'var(--secondary-text-color)' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border px-3 py-2 outline-none transition-colors"
                style={{
                  font: 'var(--font-text2-normal)',
                  borderColor: 'var(--ui-border-color)',
                  backgroundColor: 'var(--primary-background-color)',
                  color: 'var(--primary-text-color)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary-color)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ui-border-color)';
                }}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block"
                style={{ font: 'var(--font-text2-medium)', color: 'var(--secondary-text-color)' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border px-3 py-2 outline-none transition-colors"
                style={{
                  font: 'var(--font-text2-normal)',
                  borderColor: 'var(--ui-border-color)',
                  backgroundColor: 'var(--primary-background-color)',
                  color: 'var(--primary-text-color)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary-color)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ui-border-color)';
                }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full rounded-md px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                font: 'var(--font-text2-medium)',
                backgroundColor: 'var(--primary-color)',
                color: 'var(--text-color-on-primary)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'var(--primary-hover-color)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'var(--primary-color)';
              }}
            >
              {login.isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--link-color)', fontWeight: 500 }}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
