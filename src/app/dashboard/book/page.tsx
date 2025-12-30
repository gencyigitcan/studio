import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import BookingClient from './BookingClient';

export default async function BookingPage() {
    const session = await getSession();

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get classes for next 7 days
    const classes = await prisma.class.findMany({
        where: {
            startTime: {
                gte: now,
                lte: nextWeek,
            },
            status: 'SCHEDULED',
        },
        include: {
            trainer: true,
            _count: { select: { bookings: true } }
        },
        orderBy: { startTime: 'asc' },
    });

    return <BookingClient classes={classes} />;
}
