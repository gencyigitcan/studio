'use server';

import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/logger';

export async function createVideoAction(formData: FormData) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return { success: false, message: 'Yetkisiz işlem.' };

    const title = formData.get('title') as string;
    const url = formData.get('url') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;

    try {
        await prisma.video.create({
            data: { title, url, description, category, accessLevel: 'ALL' }
        });
        await logAction('VIDEO_CREATE', session.user.id, { title });
        revalidatePath('/dashboard/videos');
        return { success: true, message: 'Video eklendi.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteVideoAction(id: string) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return { success: false, message: 'Yetkisiz işlem.' };

    try {
        await prisma.video.delete({ where: { id } });
        await logAction('VIDEO_DELETE', session.user.id, { id });
        revalidatePath('/dashboard/videos');
        return { success: true, message: 'Video silindi.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
