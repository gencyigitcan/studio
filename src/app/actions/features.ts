'use server';

import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/logger';

export async function createDiscountAction(formData: FormData) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return { success: false, message: 'Yetkisiz işlem.' };

    const code = formData.get('code') as string;
    const percentage = Number(formData.get('percentage')) || null;
    const amount = Number(formData.get('amount')) || null;
    const usageLimit = Number(formData.get('usageLimit')) || null;
    const startDate = formData.get('startDate') ? new Date(formData.get('startDate') as string) : null;
    const endDate = formData.get('endDate') ? new Date(formData.get('endDate') as string) : null;

    if (!code) return { success: false, message: 'Kod zorunludur.' };

    try {
        await prisma.discount.create({
            data: {
                code: code.toUpperCase(),
                percentage,
                amount,
                usageLimit,
                startDate,
                endDate
            }
        });
        await logAction('DISCOUNT_CREATE', session.user.id, { code });
        revalidatePath('/dashboard/settings');
        return { success: true, message: 'İndirim kodu oluşturuldu.' };
    } catch (error: any) {
        return { success: false, message: 'Kod zaten mevcut olabilir.' };
    }
}

export async function joinWaitlistAction(classId: string) {
    const session = await getSession();
    if (!session) return { success: false, message: 'Giriş yapmalısınız.' };

    // Check if class exists and is full
    const cls = await prisma.class.findUnique({
        where: { id: classId },
        include: { _count: { select: { bookings: true } } }
    });

    if (!cls) return { success: false, message: 'Ders bulunamadı.' };

    // Check if already in waitlist
    const existingEntry = await prisma.waitlist.findUnique({
        where: {
            userId_classId: {
                userId: session.user.id,
                classId
            }
        }
    });

    if (existingEntry) return { success: false, message: 'Zaten bekleme listesindesiniz.' };

    // Check if already booked
    const booked = await prisma.booking.findFirst({
        where: { userId: session.user.id, classId, status: 'CONFIRMED' }
    });
    if (booked) return { success: false, message: 'Zaten bu derse kayıtlısınız.' };

    await prisma.waitlist.create({
        data: {
            userId: session.user.id,
            classId
        }
    });

    return { success: true, message: 'Bekleme listesine alındınız. Yer açılınca bildirim alacaksınız.' };
}

export async function processWaitlist(classId: string) {
    // This function should be called whenever a booking is cancelled
    const cls = await prisma.class.findUnique({
        where: { id: classId },
        include: { _count: { select: { bookings: true } } }
    });

    if (!cls || cls._count.bookings >= cls.capacity) return;

    // Get first person in waitlist
    const nextInLine = await prisma.waitlist.findFirst({
        where: { classId },
        orderBy: { createdAt: 'asc' },
        include: { user: true }
    });

    if (nextInLine) {
        // Send Notification (Ideally push/email, here just DB notification)
        await prisma.notification.create({
            data: {
                userId: nextInLine.userId,
                title: 'Yer Açıldı! 🎉',
                message: `${cls.name} dersinde yer açıldı. Hemen kayıt olabilirsiniz!`,
                type: 'SUCCESS'
            }
        });

        // Optionally auto-book if credit exists? For MVP, just notify.
        // We delete from waitlist only after they book or specific logic. 
        // Let's keep them in waitlist until they book or remove themselves.
    }
}
