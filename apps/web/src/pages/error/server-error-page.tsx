export default function ServerErrorPage() {
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
          500
        </h1>
        <h2
          className="mt-4"
          style={{ font: 'var(--font-h2-bold)', color: 'var(--primary-text-color)' }}
        >
          Server error
        </h2>
        <p
          className="mt-2"
          style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
        >
          Something went wrong on our end. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2"
          style={{
            backgroundColor: 'var(--primary-color)',
            color: 'var(--text-color-on-primary)',
            borderRadius: 'var(--border-radius-medium)',
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
