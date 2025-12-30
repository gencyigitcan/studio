import { prisma } from '@/lib/db';

async function WeeklySchedule() {
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    const day = startOfWeek.getDay(); // 0 is Sunday
    // Adjust to Monday start
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const classes = await prisma.class.findMany({
        where: {
            startTime: {
                gte: startOfWeek,
                lte: endOfWeek,
            },
            status: 'SCHEDULED',
        },
        include: {
            trainer: true,
            _count: { select: { bookings: true } },
        },
        orderBy: { startTime: 'asc' },
    });

    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const grid: Record<string, typeof classes> = {};

    days.forEach(d => grid[d] = []);

    classes.forEach(cls => {
        const dayIndex = cls.startTime.getDay(); // 0-6 Sun-Sat
        const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // 0-6 Mon-Sun
        const dayName = days[adjustedIndex];
        if (grid[dayName]) {
            grid[dayName].push(cls);
        }
    });

    return (
        <div className="card" style={{ marginTop: '2rem', overflowX: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Haftalık Ders Programı</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(140px, 1fr))', gap: '1rem', minWidth: '980px' }}>
                {days.map(day => (
                    <div key={day}>
                        <div style={{
                            fontWeight: '600',
                            textAlign: 'center',
                            padding: '0.5rem',
                            background: 'var(--color-secondary)',
                            borderRadius: 'var(--radius-sm)',
                            marginBottom: '1rem',
                            color: 'var(--color-text)'
                        }}>
                            {day}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {grid[day].length === 0 ? (
                                <div style={{ fontSize: '0.8rem', opacity: 0.5, textAlign: 'center', fontStyle: 'italic' }}>Ders yok</div>
                            ) : (
                                grid[day].map(cls => {
                                    const isFull = cls._count.bookings >= cls.capacity;
                                    return (
                                        <div key={cls.id} style={{
                                            padding: '0.75rem',
                                            background: 'var(--color-bg)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: '0.85rem'
                                        }}>
                                            <div style={{ fontWeight: '600', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                                                {cls.startTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{cls.name}</div>
                                            <div style={{ opacity: 0.7, fontSize: '0.75rem', marginBottom: '0.5rem' }}>{cls.trainer.name}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.75rem', color: isFull ? 'var(--color-error)' : 'var(--color-success)' }}>
                                                    {cls._count.bookings}/{cls.capacity}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    padding: '2px 6px',
                                                    background: cls.type === 'GROUP' ? '#e0f2fe' : '#fce7f3',
                                                    color: cls.type === 'GROUP' ? '#0369a1' : '#be185d',
                                                    borderRadius: '4px'
                                                }}>
                                                    {cls.type === 'GROUP' ? 'Grup' : 'Özel'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default WeeklySchedule;
