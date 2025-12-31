'use client';

import { useState } from 'react';
import { markAttendanceAction } from '@/app/actions/booking';
import { Check, X, AlertCircle } from 'lucide-react';

export default function AttendanceClient({ bookings, classId }: { bookings: any[], classId: string }) {
    const [loading, setLoading] = useState<string | null>(null);

    async function handleAttendance(bookingId: string, status: 'PRESENT' | 'ABSENT' | 'NOSHOW') {
        if (!confirm(`Emin misiniz? (${status})`)) return;
        setLoading(bookingId);

        try {
            const res = await markAttendanceAction(bookingId, status);
            if (res.success) {
                // Optimistically we assume success and server revalidates, 
                // but local state update would be smoother. For now relies on router refresh.
                alert(res.message);
            } else {
                alert(res.message);
            }
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="card">
            <h3>Katılımcı Listesi</h3>
            {bookings.length === 0 ? <p>Kayıtlı öğrenci yok.</p> : (
                <div style={{ marginTop: '1rem' }}>
                    {bookings.map(booking => (
                        <div key={booking.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '1rem', borderBottom: '1px solid #eee'
                        }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{booking.user.name}</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{booking.user.email}</div>
                                {booking.attendanceStatus !== 'PENDING' && (
                                    <span style={{
                                        fontSize: '0.7rem', fontWeight: 'bold',
                                        padding: '2px 6px', borderRadius: '4px',
                                        background: booking.attendanceStatus === 'PRESENT' ? '#dcfce7' : '#fee2e2',
                                        color: booking.attendanceStatus === 'PRESENT' ? '#166534' : '#991b1b',
                                        marginTop: '0.2rem', display: 'inline-block'
                                    }}>
                                        {booking.attendanceStatus === 'PRESENT' ? 'GELDİ' :
                                            booking.attendanceStatus === 'NOSHOW' ? 'GELMEDİ (NO-SHOW)' : 'GELMEDİ'}
                                    </span>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => handleAttendance(booking.id, 'PRESENT')}
                                    disabled={!!loading}
                                    title="Geldi"
                                    className="btn"
                                    style={{
                                        padding: '0.5rem', background: '#dcfce7', color: '#166534', border: 'none',
                                        opacity: booking.attendanceStatus === 'PRESENT' ? 1 : 0.5
                                    }}
                                >
                                    <Check size={18} />
                                </button>
                                <button
                                    onClick={() => handleAttendance(booking.id, 'ABSENT')}
                                    disabled={!!loading}
                                    title="Gelmedi"
                                    className="btn"
                                    style={{
                                        padding: '0.5rem', background: '#f3f4f6', color: '#374151', border: 'none',
                                        opacity: booking.attendanceStatus === 'ABSENT' ? 1 : 0.5
                                    }}
                                >
                                    <X size={18} />
                                </button>
                                <button
                                    onClick={() => handleAttendance(booking.id, 'NOSHOW')}
                                    disabled={!!loading}
                                    title="No-Show (Haber siz Gelmedi)"
                                    className="btn"
                                    style={{
                                        padding: '0.5rem', background: '#fee2e2', color: '#991b1b', border: 'none',
                                        opacity: booking.attendanceStatus === 'NOSHOW' ? 1 : 0.5
                                    }}
                                >
                                    <AlertCircle size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
