'use server';

import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { hash } from 'bcryptjs';
import { logAction } from '@/lib/logger';

// --- PACKAGES ---

export async function createPackageAction(formData: FormData) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return { success: false, message: 'Yetkisiz işlem.' };

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const credits = parseInt(formData.get('credits') as string);
    const validityDays = parseInt(formData.get('validityDays') as string);
    const type = formData.get('type') as 'GROUP' | 'PRIVATE';

    try {
        await prisma.package.create({
            data: { name, description, price, credits, validityDays, type, active: true }
        });
        await logAction('PACKAGE_CREATE', session.user.id, { name });
        revalidatePath('/dashboard/packages');
        return { success: true, message: 'Paket oluşturuldu.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function updatePackageAction(id: string, formData: FormData) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return { success: false, message: 'Yetkisiz işlem.' };

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const credits = parseInt(formData.get('credits') as string);
    const validityDays = parseInt(formData.get('validityDays') as string);
    const type = formData.get('type') as 'GROUP' | 'PRIVATE';
    const active = formData.get('active') === 'on';

    try {
        await prisma.package.update({
            where: { id },
            data: { name, description, price, credits, validityDays, type, active }
        });
        await logAction('PACKAGE_UPDATE', session.user.id, { id, name });
        revalidatePath('/dashboard/packages');
        return { success: true, message: 'Paket güncellendi.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deletePackageAction(id: string) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return { success: false, message: 'Yetkisiz işlem.' };

    try {
        await prisma.package.delete({ where: { id } });
        await logAction('PACKAGE_DELETE', session.user.id, { id });
        revalidatePath('/dashboard/packages');
        return { success: true, message: 'Paket silindi.' };
    } catch (error: any) {
        return { success: false, message: 'Bu paket kullanımda olduğu için silinemiyor olabilir. Pasife almayı deneyin.' };
    }
}

// --- CLASSES ---

export async function createClassAction(formData: FormData) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return { success: false, message: 'Yetkisiz işlem.' };

    const name = formData.get('name') as string;
    const trainerId = formData.get('trainerId') as string;
    const capacity = parseInt(formData.get('capacity') as string);
    const startTimeStr = formData.get('startTime') as string; // Expects ISO or compatible string
    const durationMinutes = parseInt(formData.get('duration') as string || '60');

    // Parse Date
    const startTime = new Date(startTimeStr);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    try {
        await prisma.class.create({
            data: {
                name,
                trainerId,
                capacity,
                startTime,
                endTime,
                status: 'SCHEDULED',
                type: capacity === 1 ? 'PRIVATE' : 'GROUP' // Simple logic
            }
        });
        await logAction('CLASS_CREATE', session.user.id, { name, startTime });
        revalidatePath('/dashboard/schedule');
        return { success: true, message: 'Ders oluşturuldu.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteClassAction(id: string) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return { success: false, message: 'Yetkisiz işlem.' };

    try {
        await prisma.class.delete({ where: { id } });
        await logAction('CLASS_DELETE', session.user.id, { id });
        revalidatePath('/dashboard/schedule');
        return { success: true, message: 'Ders silindi.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// --- USERS ---

export async function createUserAction(formData: FormData) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return { success: false, message: 'Yetkisiz işlem.' };

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as 'CUSTOMER' | 'TRAINER' | 'ADMIN';

    if (!email || !password || !name) return { success: false, message: 'Eksik bilgi.' };

    try {
        const hashedPassword = await hash(password, 12);
        await prisma.user.create({
            data: { name, email, password: hashedPassword, role }
        });
        await logAction('USER_CREATE', session.user.id, { createdUser: email, role });
        revalidatePath('/dashboard/users');
        return { success: true, message: 'Kullanıcı oluşturuldu.' };
    } catch (error: any) {
        return { success: false, message: 'Bu email zaten kullanımda olabilir.' };
    }
}

export async function updateUserRoleAction(userId: string, formData: FormData) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return { success: false, message: 'Yetkisiz işlem.' };

    const role = formData.get('role') as 'CUSTOMER' | 'TRAINER' | 'ADMIN';

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role }
        });
        await logAction('USER_UPDATE', session.user.id, { updatedUser: userId, role });
        revalidatePath('/dashboard/users');
        return { success: true, message: 'Kullanıcı güncellendi.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteUserAction(userId: string) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return { success: false, message: 'Yetkisiz işlem.' };

    try {
        await prisma.user.delete({ where: { id: userId } });
        await logAction('USER_DELETE', session.user.id, { deletedUser: userId });
        revalidatePath('/dashboard/users');
        return { success: true, message: 'Kullanıcı silindi.' };
    } catch (error: any) {
        return { success: false, message: 'Kullanıcının aktif kayıtları olduğu için silinemiyor.' };
    }
}
