import { prisma } from '@/lib/db';
import { differenceInHours, startOfWeek, endOfWeek } from 'date-fns';

export async function checkBookingRules(userId: string, classId: string) {
    const cls = await prisma.class.findUnique({
        where: { id: classId },
        include: { bookings: true }
    });
    if (!cls) return { allowed: false, reason: 'Ders bulunamadı.' };

    // 1. Capacity Check
    const activeBookingsCount = cls.bookings.filter(b => b.status === 'CONFIRMED').length;
    if (activeBookingsCount >= cls.capacity) {
        return { allowed: false, reason: 'Kontenjan dolu. Bekleme listesine katılabilirsiniz.' };
    }

    // 2. Fetch System Settings (with defaults)
    const settings = await prisma.systemSetting.findMany();
    const getSetting = (key: string, def: string) => settings.find(s => s.key === key)?.value || def;

    const maxWeekly = parseInt(getSetting('MAX_BOOKINGS_PER_WEEK', '3'));

    // 3. Max Weekly Booking Check
    const weekStart = startOfWeek(cls.startTime, { weekStartsOn: 1 }); // Monday start
    const weekEnd = endOfWeek(cls.startTime, { weekStartsOn: 1 });

    const weeklyBookings = await prisma.booking.count({
        where: {
            userId,
            status: 'CONFIRMED',
            class: {
                startTime: {
                    gte: weekStart,
                    lte: weekEnd
                }
            }
        }
    });

    if (weeklyBookings >= maxWeekly) {
        return { allowed: false, reason: `Haftalık maksimum ders hakkınız (${maxWeekly}) doldu.` };
    }

    // 4. Consecutive Classes Check (Example: Can't book if another class ends < 30 mins before)
    // This is stricter logic, skipping for now to keep MVP simple unless requested specifically.

    return { allowed: true };
}

export async function checkCancellationRules(bookingId: string) {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { class: true }
    });
    if (!booking) return { allowed: false, reason: 'Rezervasyon bulunamadı.' };

    const settings = await prisma.systemSetting.findMany();
    const getSetting = (key: string, def: string) => settings.find(s => s.key === key)?.value || def;

    const cancelWindow = parseInt(getSetting('CANCELLATION_WINDOW_HOURS', '12')); // Default 12 hours
    const hoursUntilClass = differenceInHours(booking.class.startTime, new Date());

    if (hoursUntilClass < cancelWindow) {
        return { allowed: false, reason: `Dese ${cancelWindow} saat kala iptal yapılamaz.` };
    }

    return { allowed: true };
}
