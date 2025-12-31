'use server';

import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/logger';

export async function buyPackageAction(packageId: string) {
    const session = await getSession();
    if (!session) return { success: false, message: 'Giriş gerekli.' };

    // In a real app, this would verify payment via Stripe/Iyzico
    try {
        const pkg = await prisma.package.findUnique({ where: { id: packageId } });
        if (!pkg) return { success: false, message: 'Paket bulunamadı.' };

        // Calculate end date
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + pkg.validityDays * 24 * 60 * 60 * 1000);

        await prisma.userPackage.create({
            data: {
                userId: session.user.id,
                packageId: pkg.id,
                remainingCredits: pkg.credits,
                isActive: true,
                startDate,
                endDate
            }
        });

        // Create transaction record
        await prisma.transaction.create({
            data: {
                userId: session.user.id,
                amount: pkg.price,
                type: 'INCOME', // Income for the studio
                category: 'PACKAGE_SALE', // Added category for clarity
                description: `Paket Satın Alımı: ${pkg.name}`,
                packageId: pkg.id // Link the transaction to the package
            }
        });

        await logAction('PACKAGE_PURCHASE', session.user.id, { packageId, packageName: pkg.name });

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/packages');
        return { success: true, message: 'Paket başarıyla satın alındı ve hesabınıza tanımlandı.' };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
