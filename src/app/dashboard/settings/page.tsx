import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DiscountManager from '@/components/dashboard/DiscountManager';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') redirect('/dashboard');

    const discounts = await prisma.discount.findMany({ orderBy: { createdAt: 'desc' } });

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Stüdyo Ayarları</h1>
            <div className="grid-responsive">
                <SettingsClient user={session.user} />
            </div>

            <DiscountManager discounts={discounts} />
        </div>
    );
}
