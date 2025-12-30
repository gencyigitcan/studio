'use client';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Bir şeyler ters gitti! (Global)</h2>
            <pre style={{ color: 'red', background: '#f5f5f5', padding: '1rem', borderRadius: '8px', maxWidth: '100%', overflowX: 'auto' }}>
                {error.message}
            </pre>
            {error.digest && <p>Error Digest: {error.digest}</p>}
            <button
                onClick={() => reset()}
                className="btn btn-primary"
            >
                Tekrar Dene
            </button>
        </div>
    );
}
