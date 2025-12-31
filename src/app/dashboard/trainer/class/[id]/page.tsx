import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AttendanceClient from './AttendanceClient';

export default async function ClassAttendancePage({ params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session || (session.role !== 'TRAINER' && session.role !== 'ADMIN')) redirect('/dashboard');

    const cls = await prisma.class.findUnique({
        where: { id: params.id },
        include: {
            bookings: {
                where: { status: 'CONFIRMED' },
                include: { user: true }
            }
        }
    });

    if (!cls) return <div>Ders bulunamadı.</div>;

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem' }}>{cls.name}</h1>
                <p style={{ opacity: 0.7 }}>
                    {new Date(cls.startTime).toLocaleDateString('tr-TR')} {new Date(cls.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div style={{ marginTop: '0.5rem', background: '#eee', display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                    Tip: {cls.type}
                </div>
            </div>

            <AttendanceClient bookings={cls.bookings} classId={cls.id} />
        </div>
    );
}
