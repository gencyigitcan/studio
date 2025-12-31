import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MeasurementClient from './MeasurementClient';

export default async function MeasurementsPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const role = session.role;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let students: any[] = [];
    let measurements = [];

    if (role === 'CUSTOMER') {
        measurements = await prisma.measurement.findMany({
            where: { userId: session.user.id },
            orderBy: { date: 'asc' }
        });
    } else {
        // Trainer/Admin: Get all measurements and list of students
        measurements = await prisma.measurement.findMany({
            orderBy: { date: 'asc' }
        });

        students = await prisma.user.findMany({
            where: { role: 'CUSTOMER' },
            orderBy: { name: 'asc' },
            select: { id: true, name: true, email: true }
        });
    }

    return <MeasurementClient measurements={measurements} students={students} role={role} />;
}
