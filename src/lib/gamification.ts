import { prisma } from '@/lib/db';

export async function checkAndAwardBadges(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            bookings: { where: { status: 'COMPLETED', attendanceStatus: 'PRESENT' } },
            badges: { include: { badge: true } }
        }
    });

    if (!user) return;

    const completedClasses = user.bookings.length;
    const newBadges = [];

    // 1. First Steps Badge
    if (completedClasses >= 1 && !user.badges.some(b => b.badge.slug === 'first-step')) {
        newBadges.push({
            name: 'İlk Adım',
            description: 'İlk dersini tamamladın!',
            icon: '🏅',
            slug: 'first-step'
        });
    }

    // 2. Consistency (5 Classes)
    if (completedClasses >= 5 && !user.badges.some(b => b.badge.slug === 'consistent-5')) {
        newBadges.push({
            name: 'İstikrarlı',
            description: '5 ders tamamladın.',
            icon: '🔥',
            slug: 'consistent-5'
        });
    }

    // 3. Pilates Lover (20 Classes)
    if (completedClasses >= 20 && !user.badges.some(b => b.badge.slug === 'pilates-lover')) {
        newBadges.push({
            name: 'Pilates Aşığı',
            description: 'Tam 20 ders! Harikasın.',
            icon: '💖',
            slug: 'pilates-lover'
        });
    }

    // Award Badges
    for (const badgeDef of newBadges) {
        // Find or Create Badge Definition
        let badge = await prisma.badge.findUnique({ where: { slug: badgeDef.slug } });
        if (!badge) {
            badge = await prisma.badge.create({ data: badgeDef });
        }

        // Assign to User
        await prisma.userBadge.create({
            data: {
                userId: user.id,
                badgeId: badge.id
            }
        });

        // Notify User
        await prisma.notification.create({
            data: {
                userId: user.id,
                title: `Yeni Rozet Kazandın: ${badgeDef.name}!`,
                message: badgeDef.description,
                type: 'SUCCESS'
            }
        });
    }
}

export async function updateStreak(userId: string) {
    // Basic streak logic: if attended last week, +1. If missed > 2 weeks, reset.
    // This is complex to calculate accurately retroactively. 
    // Simplified: Called when marking attendance. If last class was within 7 days, streak++. Else streak=1.

    const lastBooking = await prisma.booking.findFirst({
        where: { userId, status: 'COMPLETED', attendanceStatus: 'PRESENT' },
        orderBy: { updatedAt: 'desc' },
        skip: 1 // Skip the one just completed (as we call this AFTER update)
    });

    let newStreak = 1;

    if (lastBooking) {
        const daysDiff = (new Date().getTime() - new Date(lastBooking.updatedAt).getTime()) / (1000 * 3600 * 24);
        if (daysDiff <= 7) {
            // Increment logic requires fetching current streak from User, let's just do atomic update ideally 
            // checking 'user.streak' would be better.
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user) newStreak = user.streak + 1;
        } else {
            newStreak = 1;
        }
    }

    await prisma.user.update({
        where: { id: userId },
        data: { streak: newStreak }
    });
}
