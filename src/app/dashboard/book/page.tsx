import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import BookingClient from './BookingClient';
import AdvancedCalendar from '@/components/dashboard/AdvancedCalendar';
import { redirect } from 'next/navigation';

export default async function BookingPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 14); // 2 weeks view

    const classes = await prisma.class.findMany({
        where: {
            startTime: {
                gte: now,
                lte: nextWeek
            }
        },
        orderBy: { startTime: 'asc' },
        include: {
            trainer: true,
            bookings: { where: { status: 'CONFIRMED' } }, // Simple count check
            _count: { select: { bookings: true } }
        }
    });

    const myBookings = await prisma.booking.findMany({
        where: { userId: session.user.id, status: 'CONFIRMED' },
        select: { id: true, classId: true, status: true }
    });

    return (
        <div>
            <h1 style={{ marginBottom: '1rem', fontSize: '1.8rem' }}>Ders Programı & Rezervasyon</h1>
            <p style={{ marginBottom: '2rem', opacity: 0.7 }}>
                Derslere tıklayarak rezervasyon yapabilir veya iptal edebilirsiniz.
            </p>
            <AdvancedCalendar
                classes={classes}
                role={session.role}
                userId={session.user.id}
                myBookings={myBookings}
            />
        </div>
    );
}
