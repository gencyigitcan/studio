import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ScheduleClient from './ScheduleClient';

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
        <ScheduleClient classes={classes} trainers={trainers} />
    );
}
