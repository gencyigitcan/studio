import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DirectoryClient from './DirectoryClient';

export default async function DirectoryPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const role = session.role;
    let users = [];

    // Role-based visibility
    if (role === 'ADMIN') {
        // Admin sees everyone
        users = await prisma.user.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true, email: true, role: true, avatar: true }
        });
    } else if (role === 'TRAINER') {
        // Trainer sees Customers (Students)
        users = await prisma.user.findMany({
            where: { role: 'CUSTOMER' },
            orderBy: { name: 'asc' },
            select: { id: true, name: true, email: true, role: true, avatar: true } // Trainer can see email? Let's say yes for contact.
        });
    } else {
        // Customer sees Trainers
        users = await prisma.user.findMany({
            where: { role: 'TRAINER' },
            orderBy: { name: 'asc' },
            select: { id: true, name: true, role: true, avatar: true } // Customer sees name only, no email private
        });
    }

    return <DirectoryClient users={users} currentUserRole={role} />;
}
