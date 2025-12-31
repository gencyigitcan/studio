import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UsersClient from './UsersClient';

export default async function UsersPage() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') redirect('/dashboard');

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { bookings: true, userPackages: true } }
        }
    });

    return <UsersClient users={users} />;
}
