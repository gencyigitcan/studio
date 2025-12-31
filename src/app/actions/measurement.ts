'use server';

import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/logger';

export async function createMeasurementAction(formData: FormData) {
    const session = await getSession();
    // Trainer or Admin can add measurements
    if (!session || (session.role !== 'TRAINER' && session.role !== 'ADMIN')) {
        return { success: false, message: 'Yetkisiz işlem.' };
    }

    const userId = formData.get('userId') as string;
    const dateStr = formData.get('date') as string;
    const weight = parseFloat(formData.get('weight') as string || '0');
    const fatRatio = parseFloat(formData.get('fatRatio') as string || '0');
    const waist = parseFloat(formData.get('waist') as string || '0');
    const hips = parseFloat(formData.get('hips') as string || '0');
    const arm = parseFloat(formData.get('arm') as string || '0');
    const leg = parseFloat(formData.get('leg') as string || '0');

    if (!userId) return { success: false, message: 'Öğrenci seçimi zorunludur.' };

    try {
        await prisma.measurement.create({
            data: {
                userId,
                trainerId: session.user.id,
                date: dateStr ? new Date(dateStr) : new Date(),
                weight: weight || null,
                fatRatio: fatRatio || null,
                waist: waist || null,
                hips: hips || null,
                arm: arm || null,
                leg: leg || null
            }
        });

        await logAction('MEASUREMENT_ADD', session.user.id, { targetUserId: userId });
        revalidatePath('/dashboard/measurements');
        revalidatePath(`/dashboard/users/${userId}`); // If we have individual user pages later
        return { success: true, message: 'Ölçüm kaydedildi.' };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteMeasurementAction(id: string) {
    const session = await getSession();
    if (!session || (session.role !== 'TRAINER' && session.role !== 'ADMIN')) return { success: false };

    try {
        await prisma.measurement.delete({ where: { id } });
        revalidatePath('/dashboard/measurements');
        return { success: true, message: 'Ölçüm silindi.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
