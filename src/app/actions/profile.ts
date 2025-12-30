'use server';

import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { hash } from 'bcryptjs';

export async function updateProfileAction(formData: FormData) {
    const session = await getSession();
    if (!session) return { success: false, message: 'Giriş gerekli.' };

    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;

    try {
        const data: any = { name, phone };
        if (password && password.length > 0) {
            if (password.length < 6) throw new Error('Şifre en az 6 karakter olmalı.');
            data.password = await hash(password, 12);
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data
        });

        revalidatePath('/dashboard/profile');
        return { success: true, message: 'Profil güncellendi.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function updateHealthProfileAction(formData: FormData) {
    const session = await getSession();
    if (!session) return { success: false, message: 'Giriş gerekli.' };

    const bloodType = formData.get('bloodType') as string;
    const emergencyContact = formData.get('emergencyContact') as string;
    const injuries = formData.get('injuries') as string;
    // PAR-Q logic would go here, handling distinct fields

    try {
        // Check if exists
        const existing = await prisma.healthProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (existing) {
            await prisma.healthProfile.update({
                where: { id: existing.id },
                data: { bloodType, emergencyContact, injuries }
            });
        } else {
            await prisma.healthProfile.create({
                data: {
                    userId: session.user.id,
                    bloodType,
                    emergencyContact,
                    injuries
                }
            });
        }

        revalidatePath('/dashboard/profile');
        return { success: true, message: 'Sağlık bilgileri güncellendi.' };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
