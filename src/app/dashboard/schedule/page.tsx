import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ScheduleClient from './ScheduleClient';

import AdvancedCalendar from '@/components/dashboard/AdvancedCalendar';

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

    // Fetch trainers for the dropdown
    const trainers = await prisma.user.findMany({
        where: { role: 'TRAINER' },
        select: { id: true, name: true }
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem' }}>Ders Programı Yönetimi</h1>
                <h3 style={{ fontSize: '0.9rem', opacity: 0.7 }}>Sürükle bırak ile saati değiştirin.</h3>
            </div>

            <ScheduleClient classes={classes} trainers={trainers} />

            <div style={{ marginTop: '2rem' }}>
                <AdvancedCalendar
                    classes={classes}
                    role={session.role}
                    userId={session.user.id}
                />
            </div>
        </div>
    );
}
