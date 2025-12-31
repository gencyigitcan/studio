'use client';

import { useState } from 'react';
import { rateTrainerAction } from '@/app/actions/rating';

export default function RatingModal({ bookingId, onClose }: { bookingId: string, onClose: () => void }) {
    const [score, setScore] = useState(5);

    async function handleSubmit(formData: FormData) {
        const res = await rateTrainerAction(bookingId, formData);
        alert(res.message);
        if (res.success) onClose();
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h3 style={{ marginBottom: '1rem' }}>Eğitmeni Puanla</h3>
                <form action={handleSubmit}>
                    <input type="hidden" name="score" value={score} />

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', justifyContent: 'center' }}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setScore(s)}
                                style={{
                                    fontSize: '2rem',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: s <= score ? '#f59e0b' : '#ddd',
                                    transition: 'color 0.1s'
                                }}
                            >
                                ★
                            </button>
                        ))}
                    </div>

                    <textarea
                        name="comment"
                        className="input"
                        placeholder="Yorumunuz (İsteğe bağlı)"
                        rows={3}
                        style={{ width: '100%', marginBottom: '1rem' }}
                    />

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} className="btn btn-outline">İptal</button>
                        <button type="submit" className="btn btn-primary">Kaydet</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
