'use server';

import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';

export async function getDashboardReports() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');

    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    // 1. Occupancy Rate (This Month)
    const totalCapacity = await prisma.class.aggregate({
        _sum: { capacity: true },
        where: { startTime: { gte: start, lte: end } }
    });

    const totalBookings = await prisma.booking.count({
        where: {
            class: { startTime: { gte: start, lte: end } },
            status: { in: ['CONFIRMED', 'COMPLETED'] }
        }
    });

    const occupancyRate = totalCapacity._sum.capacity ? (totalBookings / totalCapacity._sum.capacity) * 100 : 0;

    // 2. No-Show Rate
    const totalFinished = await prisma.booking.count({
        where: { attendanceStatus: { in: ['PRESENT', 'NOSHOW'] } }
    });
    const totalNoShow = await prisma.booking.count({
        where: { attendanceStatus: 'NOSHOW' }
    });
    const noShowRate = totalFinished ? (totalNoShow / totalFinished) * 100 : 0;

    // 3. Trainer Performance (Top 5 by Rating)
    const topTrainers = await prisma.trainerProfile.findMany({
        orderBy: [{ rating: 'desc' }, { ratingCount: 'desc' }],
        take: 5,
        include: { user: { select: { name: true, avatar: true } } }
    });

    // 4. Daily Booking Trend (Last 7 days or Month)
    // Simplify: Group by day for this month chart.
    // Prisma grouping by date is tricky without raw queries in SQLite/Postgres differences. 
    // We will fetch all bookings this month and process in JS for MVP flexibility.
    const monthlyBookings = await prisma.booking.findMany({
        where: {
            createdAt: { gte: start, lte: end }
        },
        select: { createdAt: true }
    });

    const bookingsByDay: Record<string, number> = {};
    monthlyBookings.forEach(b => {
        const day = format(b.createdAt, 'dd MMM');
        bookingsByDay[day] = (bookingsByDay[day] || 0) + 1;
    });

    const chartData = Object.keys(bookingsByDay).map(date => ({
        date,
        count: bookingsByDay[date]
    }));

    return {
        occupancyRate,
        noShowRate,
        topTrainers,
        chartData,
        totalBookings,
        totalCapacity: totalCapacity._sum.capacity || 0
    };
}
