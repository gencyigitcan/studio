'use server';

import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/mail';

export async function bookClassAction(classId: string) {
    const session = await getSession();
    if (!session) return { success: false, message: 'Giriş yapmalısınız.' };

    const userId = session.user.id;

    try {
        // 1. Transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // Get Class details
            const targetClass = await tx.class.findUnique({
                where: { id: classId },
                include: { bookings: true, waitlist: true, trainer: true }
            });

            if (!targetClass) throw new Error('Ders bulunamadı.');

            // Check if already booked
            const existingBooking = await tx.booking.findFirst({
                where: { classId, userId, status: 'CONFIRMED' }
            });
            if (existingBooking) throw new Error('Bu derse zaten rezervasyonunuz var.');

            // Check Capacity
            const confirmedCount = targetClass.bookings.filter(b => b.status === "CONFIRMED").length;
            const isFull = confirmedCount >= targetClass.capacity;

            if (isFull) {
                // Add to Waitlist
                const existingWaitlist = await tx.waitlist.findUnique({
                    where: { userId_classId: { userId, classId } }
                });

                if (existingWaitlist) throw new Error('Zaten yedek listedesiniz.');

                await tx.waitlist.create({
                    data: { userId, classId }
                });

                return { status: 'WAITLIST', message: 'Ders dolu. Yedek listeye eklendiniz.' };
            }

            // Normal Booking: Check Credits
            // Find an active package with credits
            const activeUserPackage = await tx.userPackage.findFirst({
                where: {
                    userId,
                    isActive: true,
                    remainingCredits: { gt: 0 }
                },
                orderBy: { endDate: 'asc' } // Use the one expiring soonest
            });

            // Special handling: If Admin/Trainer booking, maybe bypass credit check? 
            // For now, enforcing credits for Customers.
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

            // Create Transaction Record (Log Usage)
            // For revenue tracking, we might want to attribute a value here, e.g. PackagePrice / TotalCredits
            // For simplicity in MVP, we might just log it.
            // But let's verify if we need detailed accounting now. 
            // "Finansal Raporlar" was requested.
            // A usage transaction has 0 monetary value technically (revenue was at package sale), 
            // but we can track "Value Delivered". Let's skip money for usage to avoid double counting revenue.

            return { status: 'CONFIRMED', message: 'Rezervasyon başarıyla oluşturuldu.', bookingId: booking.id, className: targetClass.name, time: targetClass.startTime };
        });

        // 2. Notifications (Outside Transaction to keep it fast)
        if (result.status === 'CONFIRMED') {
            await sendEmail(
                session.user.email,
                'Rezervasyon Onayı - Pilates Studio',
                `<p>Merhaba,</p><p><strong>${result.className}</strong> dersine rezervasyonunuz onaylandı.</p><p>Tarih: ${new Date(result.time!).toLocaleString('tr-TR')}</p>`
            );
        } else if (result.status === 'WAITLIST') {
            await sendEmail(
                session.user.email,
                'Yedek Liste Bildirimi - Pilates Studio',
                `<p>Merhaba,</p><p>İstediğiniz ders şu an dolu olduğu için yedek listeye alındınız.</p>`
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

            // Authorization check
            if (booking.userId !== session.user.id && session.user.role !== 'ADMIN') {
                throw new Error('Bu işlemi yapmaya yetkiniz yok.');
            }

            if (booking.status !== 'CONFIRMED') throw new Error('Bu rezervasyon zaten iptal edilmiş.');

            const now = new Date();
            const classTime = new Date(booking.class.startTime);
            const hoursDiff = (classTime.getTime() - now.getTime()) / (1000 * 60 * 60);

            let refund = false;
            if (hoursDiff >= 12) {
                refund = true;
            }

            // Update Booking Status
            await tx.booking.update({
                where: { id: bookingId },
                data: { status: 'CANCELLED' }
            });

            // Refund Credit if applicable
            if (refund && booking.userPackageId) {
                await tx.userPackage.update({
                    where: { id: booking.userPackageId },
                    data: { remainingCredits: { increment: 1 } }
                });
            }

            // Handle Waitlist (Auto-promote first person?)
            // Simple "First in line" logic
            const firstWaiter = await tx.waitlist.findFirst({
                where: { classId: booking.classId },
                orderBy: { createdAt: 'asc' },
                include: { user: true }
            });

            let promotedUserEmail = null;

            if (firstWaiter) {
                // Remove from waitlist
                await tx.waitlist.delete({ where: { id: firstWaiter.id } });

                // We need to check if this waiter has credits too! 
                // This complexity suggests we should maybe just NOTIFY them instead of auto-booking.
                // "Yedek listeden asil listeye geçince bildirim" was the request.
                // So we assume we just notify them that a spot opened?
                // OR we move them to confirmed if we can.
                // Let's implement NOTIFY ONLY for safety in MVP to avoid negative balance issues.
                promotedUserEmail = firstWaiter.user.email;
            }

            return {
                message: refund ? 'Rezervasyon iptal edildi ve kredi iade edildi.' : 'Rezervasyon iptal edildi ancak 12 saat kuralı nedeniyle kredi iade edilmedi.',
                classTime: booking.class.startTime,
                className: booking.class.name,
                promotedUserEmail
            };
        });

        // Notify User
        await sendEmail(
            session.user.email,
            'Rezervasyon İptali',
            `<p>${result.message}</p>`
        );

        // Notify Waitlist User
        if (result.promotedUserEmail) {
            await sendEmail(
                result.promotedUserEmail,
                'Yer Açıldı! - Pilates Studio',
                `<p>Müjde! <strong>${result.className}</strong> dersinde bir kişilik yer açıldı.</p><p>Hemen girip rezervasyon yapabilirsiniz.</p>`
            );
        }

        revalidatePath('/dashboard');
        return { success: true, message: result.message };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
