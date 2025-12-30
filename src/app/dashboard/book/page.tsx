import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export default async function BookingPage() {
    const session = await getSession();

    // Get classes for next 7 days
    const classes = await prisma.class.findMany({
        where: {
            startTime: {
                gte: new Date(),
                lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
            status: 'SCHEDULED',
        },
        include: {
            trainer: true,
            _count: { select: { bookings: true } }
        },
        orderBy: { startTime: 'asc' },
    });

    return (
        <div>
            <h1 style={{ marginBottom: '1.5rem' }}>Ders Programı</h1>

            <div className="grid-responsive">
                {classes.map((cls) => {
                    const isFull = cls._count.bookings >= cls.capacity;

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
                                    {cls.type}
                                </div>
                            </div>

                            <div style={{ margin: '1rem 0' }}>
                                <div style={{ fontWeight: '600' }}>
                                    {new Date(cls.startTime).toLocaleDateString('tr-TR', { weekday: 'long' })}
                                </div>
                                <div>
                                    {new Date(cls.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    {' - '}
                                    {new Date(cls.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem' }}>
                                    Kapasite: {cls._count.bookings} / {cls.capacity}
                                </span>
                                <button className="btn btn-primary" disabled={isFull} style={{ opacity: isFull ? 0.5 : 1 }}>
                                    {isFull ? 'Dolu' : 'Rezervasyon Yap'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
