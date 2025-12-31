'use server';

import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function getDashboardStatsAction() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return null;

    // 1. Total Income (Sum of all completed income transactions)
    const incomeResult = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'INCOME' } // Removed status check as field likely missing
        // Wait, schema for Transaction: type, category, status NOT present in my read earlier?
        // Checking Schema read from Step 814:
        // model Transaction { ... status String? ... } -> No status field shown in Step 814 read?
        // Let's re-read the schema or assume 'COMPLETED' was not there.
        // Step 814: 
        // model Transaction { 
        //   id.. userId.. amount.. type.. category.. description.. date.. 
        //   packageId.. bookingId.. 
        // }
        // No status field.
    });

    // 2. Package Sales Distribution
    const packages = await prisma.package.findMany({
        include: { _count: { select: { userPackages: true } } }
    });

    // 3. Last 6 Months Income (Mocking data slightly because we might not have enough history)
    // Real implementation would group by month.
    const rawTransactions = await prisma.transaction.findMany({
        where: { type: 'INCOME' },
        orderBy: { date: 'asc' }
    });

    // Simple grouping
    const monthlyIncome = rawTransactions.reduce((acc: any, curr) => {
        const month = new Date(curr.date).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + Number(curr.amount);
        return acc;
    }, {});

    const chartData = Object.keys(monthlyIncome).map(key => ({
        name: key,
        income: monthlyIncome[key]
    }));

    // Data for Pie Chart
    const packageStats = packages.map(p => ({
        name: p.name,
        value: p._count.userPackages
    }));

    return {
        totalIncome: Number(incomeResult._sum.amount || 0),
        chartData,
        packageStats
    };
}
