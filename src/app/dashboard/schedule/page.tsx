import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function SchedulePage() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') redirect('/dashboard');

    const classes = await prisma.class.findMany({
        orderBy: { startTime: 'desc' },
        include: {
            trainer: true,
            _count: { select: { bookings: true } }
        },
        take: 50 // simplistic for MVP
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem' }}>Ders Programı Yönetimi</h1>
                <button className="btn btn-primary">Yeni Ders Oluştur</button>
            </div>

            <div className="card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-bg)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>Ders Adı</th>
                            <th style={{ padding: '1rem' }}>Eğitmen</th>
                            <th style={{ padding: '1rem' }}>Tarih / Saat</th>
                            <th style={{ padding: '1rem' }}>Kapasite</th>
                            <th style={{ padding: '1rem' }}>Durum</th>
                            <th style={{ padding: '1rem' }}>İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classes.map(cls => (
                            <tr key={cls.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '1rem', fontWeight: '500' }}>{cls.name}</td>
                                <td style={{ padding: '1rem' }}>{cls.trainer.name}</td>
                                <td style={{ padding: '1rem' }}>
                                    {new Date(cls.startTime).toLocaleDateString()}
                                    <br />
                                    <span style={{ opacity: 0.7 }}>
                                        {new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                        {new Date(cls.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {cls._count.bookings} / {cls.capacity}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: cls.status === 'SCHEDULED' ? '#bbf7d0' : '#fecaca',
                                        fontSize: '0.8rem'
                                    }}>
                                        {cls.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Düzenle</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
