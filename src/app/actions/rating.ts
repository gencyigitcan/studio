'use server';

import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/logger';

export async function rateTrainerAction(bookingId: string, formData: FormData) {
    const session = await getSession();
    if (!session) return { success: false, message: 'Giriş yapmalısınız.' };

    const score = parseInt(formData.get('score') as string);
    const comment = formData.get('comment') as string;

    if (!score || score < 1 || score > 5) return { success: false, message: 'Geçersiz puan.' };

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { class: true }
        });

        if (!booking) return { success: false, message: 'Ders bulunamadı.' };
        if (booking.userId !== session.user.id) return { success: false, message: 'Bu işlem size ait değil.' };

        // Check availability of duplicate rating
        const existing = await prisma.rating.findUnique({ where: { bookingId } });
        if (existing) return { success: false, message: 'Zaten puanladınız.' };

        await prisma.rating.create({
            data: {
                bookingId,
                userId: session.user.id,
                trainerId: booking.class.trainerId,
                score,
                comment
            }
        });

        // Update Trainer Stats (Avg Rating)
        // This aggregation is heavy for high scale, but okay for MVP.
        const ratings = await prisma.rating.findMany({ where: { trainerId: booking.class.trainerId } });
        const total = ratings.reduce((acc, r) => acc + r.score, 0);
        const avg = total / ratings.length;

        // Upsert Profile
        await prisma.trainerProfile.upsert({
            where: { userId: booking.class.trainerId },
            create: {
                userId: booking.class.trainerId,
                rating: avg,
                ratingCount: ratings.length
            },
            update: {
                rating: avg,
                ratingCount: ratings.length
            }
        });

        await logAction('RATING_GIVE', session.user.id, { trainerId: booking.class.trainerId, score });

        revalidatePath('/dashboard/book');
        return { success: true, message: 'Puanınız kaydedildi. Teşekkürler!' };
    } catch (error: any) {
        return { success: false, message: 'Bir hata oluştu.' };
    }
}
