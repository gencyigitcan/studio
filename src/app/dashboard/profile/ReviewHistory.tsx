'use client';

import { useState } from 'react';
import RatingModal from '@/components/dashboard/RatingModal';

export default function ReviewHistory({ bookings }: { bookings: any[] }) {
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Geçmiş Ders Değerlendirme</h2>
            {bookings.length === 0 ? (
                <p style={{ opacity: 0.6 }}>Değerlendirilecek geçmiş ders bulunamadı.</p>
            ) : (
                <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                    {bookings.map(b => (
                        <div key={b.id} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px' }}>
                            <div style={{ fontWeight: 'bold' }}>{b.class.name}</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>
                                {new Date(b.class.startTime).toLocaleDateString('tr-TR')}
                            </div>
                            <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                                Eğitmen: {b.class.trainer.name}
                            </div>

                            {b.rating ? (
                                <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    ★ {b.rating.score}/5 Puan Verildi
                                </div>
                            ) : (
                                <button
                                    onClick={() => setSelectedBookingId(b.id)}
                                    className="btn btn-outline"
                                    style={{ width: '100%', fontSize: '0.9rem', padding: '0.5rem' }}
                                >
                                    Eğitmeni Puanla
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {selectedBookingId && (
                <RatingModal
                    bookingId={selectedBookingId}
                    onClose={() => setSelectedBookingId(null)}
                />
            )}
        </div>
    );
}
