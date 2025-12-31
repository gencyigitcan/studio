import { getDashboardReports } from '@/app/actions/reports';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ReportsClient from './ReportsClient';

export default async function ReportsPage() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') redirect('/dashboard');

    const bookingData = await getDashboardReports();

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Raporlar & Analizler</h1>
            <ReportsClient data={bookingData} />
        </div>
    );
}
