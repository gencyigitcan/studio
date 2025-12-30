'use client';

import { useEffect } from 'react';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Dashboard Error:', error);
    }, [error]);

    return (
        <div className="card" style={{ margin: '2rem', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>Panel yüklenirken bir sorun oluştu.</h2>
            <p style={{ marginBottom: '1rem', opacity: 0.7 }}>{error.message}</p>
            <button
                onClick={() => reset()}
                className="btn btn-primary"
            >
                Yeniden Yükle
            </button>
        </div>
    );
}
