export default function ServerErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-foreground">500</h1>
        <h2 className="mt-4 text-2xl font-semibold text-foreground">Server error</h2>
        <p className="mt-2 text-muted-foreground">
          Something went wrong on our end. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
