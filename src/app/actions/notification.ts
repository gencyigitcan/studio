'use server';

import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/logger';

export async function sendNotificationAction(userIds: string[], title: string, message: string, type: 'INFO' | 'WARNING' | 'SUCCESS' = 'INFO') {
    const session = await getSession();
    // Allow Trainers to notify their students? For now, allow Admin and Trainer.
    if (!session || (session.role !== 'ADMIN' && session.role !== 'TRAINER')) {
        return { success: false, message: 'Yetkisiz işlem.' };
    }

    try {
        const data = userIds.map(id => ({
            userId: id,
            title,
            message,
            type,
            read: false
        }));

        await prisma.notification.createMany({ data });

        await logAction('NOTIFICATION_SEND', session.user.id, { count: userIds.length, title });

        revalidatePath('/dashboard');
        return { success: true, message: 'Bildirimler gönderildi.' };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function markNotificationAsReadAction(notificationId: string) {
    const session = await getSession();
    if (!session) return { success: false, message: 'Auth required' };

    try {
        await prisma.notification.update({
            where: { id: notificationId }, // Ideally strict check if belongs to user
            data: { read: true }
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch {
        return { success: false };
    }
}
