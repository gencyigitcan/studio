import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Users } from 'lucide-react';

export default async function TrainerPanel() {
    const session = await getSession();
    if (!session || session.role !== 'TRAINER') redirect('/dashboard');

    // Fetch upcoming classes for this trainer
    const classes = await prisma.class.findMany({
        where: {
            trainerId: session.user.id,
            startTime: { gte: new Date() } // Future
        },
        orderBy: { startTime: 'asc' },
        include: {
            _count: { select: { bookings: true } },
            bookings: true
        },
        take: 10
    });

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Eğitmen Paneli</h1>

            <div className="card">
                <h3>Yaklaşan Derslerin</h3>
                {classes.length === 0 ? (
                    <p>Yakın zamanda dersin görünmüyor.</p>
                ) : (
                    <div style={{ marginTop: '1rem' }}>
                        {classes.map(cls => (
                            <Link href={`/dashboard/trainer/class/${cls.id}`} key={cls.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{
                                    border: '1px solid #eee',
                                    padding: '1rem',
                                    marginBottom: '1rem',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    background: 'white',
                                    transition: 'transform 0.1s',
                                }} className="hover-scale">
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{cls.name}</div>
                                        <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                                            {new Date(cls.startTime).toLocaleDateString('tr-TR')} - {new Date(cls.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                                            <Users size={16} />
                                            <span>{cls._count.bookings} / {cls.capacity}</span>
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: '#666' }}>Yoklama Al &rarr;</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
