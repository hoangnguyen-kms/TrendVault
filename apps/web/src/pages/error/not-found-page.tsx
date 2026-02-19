import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: 'var(--primary-background-color)' }}
    >
      <div className="max-w-md text-center">
        <h1
          style={{
            font: 'var(--font-h1-bold)',
            color: 'var(--primary-text-color)',
            fontSize: '3.75rem',
          }}
        >
          404
        </h1>
        <h2
          className="mt-4"
          style={{ font: 'var(--font-h2-bold)', color: 'var(--primary-text-color)' }}
        >
          Page not found
        </h2>
        <p
          className="mt-2"
          style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block px-4 py-2"
          style={{
            backgroundColor: 'var(--primary-color)',
            color: 'var(--text-color-on-primary)',
            borderRadius: 'var(--border-radius-medium)',
          }}
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
