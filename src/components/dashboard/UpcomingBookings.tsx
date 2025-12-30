'use client';

import { cancelBookingAction } from '@/app/actions/booking';
import { useRouter } from 'next/navigation';

export default function UpcomingBookings({ bookings }: { bookings: any[] }) {
    const router = useRouter();

    const handleCancel = async (bookingId: string) => {
        if (!confirm('Rezervasyonu iptal etmek istediğinize emin misiniz? (Ders saatine 12 saatten az kaldıysa kredi iadesi yapılmaz)')) return;

        const result = await cancelBookingAction(bookingId);
        if (result.success) {
            alert(result.message);
            // Router refresh to update the list
            router.refresh();
        } else {
            alert('Hata: ' + result.message);
        }
    };

    return (
        <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Yaklaşan Dersler</h2>
            {bookings.length === 0 ? (
                <p>Yaklaşan rezervasyonunuz yok.</p>
            ) : (
                bookings.map(booking => (
                    <div key={booking.id} style={{ marginBottom: '0.8rem', padding: '0.8rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: '600' }}>{booking.class.name}</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                                {new Date(booking.class.startTime).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                <br />
                                {new Date(booking.class.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                {' - '}
                                {booking.class.trainer.name}
                            </div>
                        </div>
                        <button
                            onClick={() => handleCancel(booking.id)}
                            className="btn btn-outline"
                            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                        >
                            İptal Et
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}
