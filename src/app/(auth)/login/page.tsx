'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions/auth';
import { Loader2 } from 'lucide-react';

const initialState = {
    error: '',
};

export default function LoginPage() {
    const [state, action, isPending] = useActionState(loginAction, initialState);

    return (
        <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '2rem' }}>
            <div className="animate-fade-in card glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '300', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                        Pilates Studio
                    </h1>
                    <p style={{ color: 'var(--color-text)', opacity: 0.8 }}>Giriş Yap</p>
                </div>

                <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            className="input-field"
                            placeholder="ornek@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Şifre</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            className="input-field"
                            placeholder="••••••••"
                        />
                    </div>

                    {state?.error && (
                        <div style={{ color: 'var(--color-error)', fontSize: '0.9rem', textAlign: 'center', padding: '0.5rem', background: '#fee2e2', borderRadius: 'var(--radius-sm)' }}>
                            {state.error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isPending}
                        style={{ marginTop: '1rem' }}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Giriş Yapılıyor...
                            </>
                        ) : (
                            'Giriş Yap'
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text)', opacity: 0.6 }}>
                    <p>Demo Hesaplar:</p>
                    <p>admin@pilates.com / admin123</p>
                    <p>trainer@pilates.com / trainer123</p>
                    <p>user@example.com / user123</p>
                </div>
            </div>
        </div>
    );
}
