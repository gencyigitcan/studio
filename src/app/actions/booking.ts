'use server';

import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/mail';
import { logAction } from '@/lib/logger';
import { checkBookingRules } from '@/lib/rules';
import { checkAndAwardBadges, updateStreak } from '@/lib/gamification';

export async function bookClassAction(classId: string) {
    const session = await getSession();
    if (!session) return { success: false, message: 'Giriş yapmalısınız.' };

    const userId = session.user.id;

    try {
        // --- 0. Rule Engine Check ---
        const ruleCheck = await checkBookingRules(userId, classId);
        if (!ruleCheck.allowed) {
            // If full, offer waitlist? 
            // The rule engine 'reason' might be "Capacity Full"
            // But my checkBookingRules returns 'Capacity Full' only if full.
            // If 'Max Weekly' etc, it returns distinct message.

            // Special case: If capacity full, we can try Waitlist flow.
            // But simpler to let the UI handle "Join Waitlist" action separately if full.
            // Here we just error out or handled specific status.
            return { success: false, message: ruleCheck.reason };
        }

        // 1. Transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // Get Class details
            const targetClass = await tx.class.findUnique({
                where: { id: classId },
                include: { bookings: true, waitlist: true, trainer: true }
            });

            if (!targetClass) throw new Error('Ders bulunamadı.');

            // Double Check Capacity (Race Condition Protection)
            const confirmedCount = targetClass.bookings.filter(b => b.status === "CONFIRMED").length;
            if (confirmedCount >= targetClass.capacity) {
                return { status: 'FULL', message: 'Ders kontanı az önce doldu.' };
            }

            // Normal Booking: Check Credits
            const activeUserPackage = await tx.userPackage.findFirst({
                where: {
                    userId,
                    isActive: true,
                    remainingCredits: { gt: 0 }
                },
                orderBy: { endDate: 'asc' }
            });

            if (!activeUserPackage && session.user.role === 'CUSTOMER') {
                throw new Error('Aktif paketiniz veya krediniz yetersiz.');
            }

            // Deduct Credit
            if (activeUserPackage) {
                await tx.userPackage.update({
                    where: { id: activeUserPackage.id },
                    data: { remainingCredits: { decrement: 1 } }
                });
            }

            // Create Booking
            const booking = await tx.booking.create({
                data: {
                    userId,
                    classId,
                    userPackageId: activeUserPackage?.id,
                    status: 'CONFIRMED'
                }
            });

            // Clean Waitlist if user was in it
            await tx.waitlist.deleteMany({
                where: { userId, classId }
            });

            return { status: 'CONFIRMED', message: 'Rezervasyon başarıyla oluşturuldu.', bookingId: booking.id, className: targetClass.name, time: targetClass.startTime };
        });

        // 2. Notifications & Logging
        if (result.status === 'CONFIRMED') {
            await logAction('BOOKING_CREATE', userId, { classId, className: result.className });
            await sendEmail(
                session.user.email,
                'Rezervasyon Onayı - Pilates Studio',
                `<p>Merhaba,</p><p><strong>${result.className}</strong> dersine rezervasyonunuz onaylandı.</p><p>Tarih: ${new Date(result.time!).toLocaleString('tr-TR')}</p>`
            );
        }

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/book');
        return { success: true, message: result.message };

    } catch (error: any) {
        return { success: false, message: error.message || 'Bir hata oluştu.' };
    }
}

export async function cancelBookingAction(bookingId: string) {
    const session = await getSession();
    if (!session) return { success: false, message: 'Yetkisiz işlem.' };

    try {
        const result = await prisma.$transaction(async (tx) => {
            const booking = await tx.booking.findUnique({
                where: { id: bookingId },
                include: { class: true, user: true }
            });

            if (!booking) throw new Error('Rezervasyon bulunamadı.');
            if (booking.userId !== session.user.id && session.user.role !== 'ADMIN') throw new Error('Yetkisiz işlem.');
            if (booking.status !== 'CONFIRMED') throw new Error('Zaten iptal edilmiş.');

            // Fetch Cancellation Window from Settings
            const setting = await tx.systemSetting.findUnique({ where: { key: 'CANCELLATION_WINDOW_HOURS' } });
            const cancelWindow = parseInt(setting?.value || '12');

            const now = new Date();
            const classTime = new Date(booking.class.startTime);
            const hoursDiff = (classTime.getTime() - now.getTime()) / (1000 * 60 * 60);

            let refund = false;
            if (hoursDiff >= cancelWindow) {
                refund = true;
            }

            // Check if too late to even cancel? 
            // For now, allow cancel anytime, but only refund if early.

            // Update Booking Status
            await tx.booking.update({
                where: { id: bookingId },
                data: { status: 'CANCELLED', deletedAt: new Date() } // Soft delete concept or just status? Use status.
            });

            // Refund Credit
            if (refund && booking.userPackageId) {
                await tx.userPackage.update({
                    where: { id: booking.userPackageId },
                    data: { remainingCredits: { increment: 1 } }
                });
            }

            // Notify Waitlist logic... (Simplification: just notify First)
            const firstWaiter = await tx.waitlist.findFirst({
                where: { classId: booking.classId },
                orderBy: { createdAt: 'asc' },
                include: { user: true }
            });

            let promotedUserEmail = null;
            if (firstWaiter) {
                // Just notify, don't auto-book to avoid credit issues without consent
                promotedUserEmail = firstWaiter.user.email;
                await tx.notification.create({
                    data: {
                        userId: firstWaiter.userId,
                        title: 'Yer Açıldı!',
                        message: `${booking.class.name} dersinde yer açıldı.`,
                        type: 'SUCCESS'
                    }
                });
            }

            return {
                message: refund ? 'İptal edildi ve kredi iade edildi.' : `İptal edildi. (${cancelWindow} saat kuralı nedeniyle iade yapılmadı.)`,
                promotedUserEmail,
                className: booking.class.name
            };
        });

        revalidatePath('/dashboard');
        return { success: true, message: result.message };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function markAttendanceAction(bookingId: string, status: 'PRESENT' | 'ABSENT' | 'NOSHOW') {
    const session = await getSession();
    if (!session || (session.role !== 'TRAINER' && session.role !== 'ADMIN')) return { success: false, message: 'Yetkisiz işlem.' };

    try {
        const booking = await prisma.booking.update({
            where: { id: bookingId },
            data: { attendanceStatus: status },
            include: { user: true }
        });

        if (status === 'PRESENT') {
            // 1. Award Loyalty Points
            await prisma.user.update({
                where: { id: booking.userId },
                data: { loyaltyPoints: { increment: 10 } }
            });
            // 2. Streaks
            await updateStreak(booking.userId);
            // 3. Badges
            await checkAndAwardBadges(booking.userId);
        } else if (status === 'NOSHOW') {
            // Increment No Show
            await prisma.user.update({
                where: { id: booking.userId },
                data: { noShowCount: { increment: 1 } }
            });
        }

        revalidatePath('/dashboard/schedule');
        // Or wherever trainer sees the list
        return { success: true, message: 'Yoklama alındı.' };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
