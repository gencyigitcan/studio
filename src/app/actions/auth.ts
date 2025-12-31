'use server'

import { prisma } from '@/lib/db';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

import { logAction } from '@/lib/logger';

export async function loginAction(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const remember = formData.get('remember') === 'on';

    if (!email || !password) {
        return { error: 'Email ve şifre gereklidir.' };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return { error: 'Kullanıcı bulunamadı.' };
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
            return { error: 'Şifre hatalı.' };
        }

        // Create session
        const duration = remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days vs 1 day
        const expires = new Date(Date.now() + duration);

        const session = await encrypt({
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            role: user.role, // Top level role for easy access
            expires
        });

        const cookieStore = await cookies();
        cookieStore.set('session', session, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires,
            sameSite: 'lax',
            path: '/',
        });

        await logAction('LOGIN', user.id, { remember });

    } catch (error) {
        console.error('Login error:', error);
        return { error: 'Bir hata oluştu.' };
    }

    redirect('/dashboard');
}

export async function logoutAction() {
    await logAction('LOGOUT');
    const cookieStore = await cookies();
    cookieStore.delete('session');
    redirect('/login');
}
