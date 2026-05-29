'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Something went wrong</h2>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
              {error.message || 'An unexpected error occurred.'}
            </p>
            <button
              style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '0.375rem', backgroundColor: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}
              onClick={() => reset()}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
