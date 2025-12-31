import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PackagesClient from './PackagesClient';

export default async function PackagesPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    // Admin should see ALL packages (even inactive), Customers only active
    const where = session.role === 'ADMIN' ? {} : { active: true };

    const packages = await prisma.package.findMany({
        where,
        orderBy: { price: 'asc' }
    });

    const user = session.user;

    // If customer, show their active packages too
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let myPackages: any[] = [];
    if (user.role === 'CUSTOMER') {
        myPackages = await prisma.userPackage.findMany({
            where: { userId: user.id, isActive: true },
            include: { package: true }
        });
    }

    return (
        <PackagesClient
            packages={packages}
            myPackages={myPackages}
            role={user.role}
        />
    );
}
