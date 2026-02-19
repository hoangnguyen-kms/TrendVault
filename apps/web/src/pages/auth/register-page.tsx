import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Icon } from '@vibe/core';
import { Activity } from '@vibe/icons';
import { useRegister } from '@/hooks/use-auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      await register.mutateAsync({ name, email, password });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const inputStyle = {
    font: 'var(--font-text2-normal)',
    borderColor: 'var(--ui-border-color)',
    backgroundColor: 'var(--primary-background-color)',
    color: 'var(--primary-text-color)',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--primary-color)';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--ui-border-color)';
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
            Create your account
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
                htmlFor="name"
                className="mb-2 block"
                style={{ font: 'var(--font-text2-medium)', color: 'var(--secondary-text-color)' }}
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md border px-3 py-2 outline-none transition-colors"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="John Doe"
              />
            </div>

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
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
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
                minLength={8}
                className="w-full rounded-md border px-3 py-2 outline-none transition-colors"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="••••••••"
              />
              <p
                className="mt-1"
                style={{ font: 'var(--font-text3-normal)', color: 'var(--secondary-text-color)' }}
              >
                Must be at least 8 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={register.isPending}
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
              {register.isPending ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--link-color)', fontWeight: 500 }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
