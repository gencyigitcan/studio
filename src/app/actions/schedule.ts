'use server';

import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/logger';

export async function updateClassTimeAction(classId: string, newStartTime: Date, newEndTime: Date) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return { success: false, message: 'Yetkisiz işlem.' };

    try {
        await prisma.class.update({
            where: { id: classId },
            data: { startTime: newStartTime, endTime: newEndTime }
        });

        // Log it
        await logAction('CLASS_RESCHEDULE', session.user.id, { classId, newStartTime });

        revalidatePath('/dashboard/schedule');
        return { success: true, message: 'Ders saati güncellendi.' };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
