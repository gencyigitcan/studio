'use client';

import { bookClassAction } from '@/app/actions/booking';

function BookingButton({ classId, isFull }: { classId: string, isFull: boolean }) {

    const handleClick = async () => {
        if (!confirm(isFull ? 'Ders dolu. Yedek listeye yazılmak ister misiniz?' : 'Rezervasyonu onaylıyor musunuz?')) return;

        const result = await bookClassAction(classId);

        if (result.success) {
            alert(result.message);
        } else {
            alert('Hata: ' + result.message);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`btn ${isFull ? 'btn-outline' : 'btn-primary'}`}
            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
        >
            {isFull ? 'Yedek Liste' : 'Rezervasyon Yap'}
        </button>
    );
}

export default function BookPage({ classes }: { classes: any[] }) {
    return (
        <div>
            <h1 style={{ marginBottom: '1.5rem' }}>Ders Programı</h1>

            <div className="grid-responsive">
                {classes.map((cls) => {
                    const isFull = cls._count.bookings >= cls.capacity;

                    // Parse dates if they were passed as strings from Server Component
                    const startTime = new Date(cls.startTime);
                    const endTime = new Date(cls.endTime);

                    return (
                        <div key={cls.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <h3 style={{ color: 'var(--color-primary)' }}>{cls.name}</h3>
                                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>{cls.trainer.name}</p>
                                </div>
                                <div style={{
                                    background: isFull ? 'var(--color-error)' : 'var(--color-accent)',
                                    color: 'white',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.8rem'
                                }}>
                                    {cls.type === 'GROUP' ? 'GRUP' : 'ÖZEL'}
                                </div>
                            </div>

                            <div style={{ margin: '1rem 0' }}>
                                <div style={{ fontWeight: '600' }}>
                                    {startTime.toLocaleDateString('tr-TR', { weekday: 'long' })}
                                </div>
                                <div>
                                    {startTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    {' - '}
                                    {endTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem' }}>
                                    Kapasite: {cls._count.bookings} / {cls.capacity}
                                </span>
                                <BookingButton
                                    classId={cls.id}
                                    isFull={isFull}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
