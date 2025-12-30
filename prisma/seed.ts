import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Clean up
    await prisma.booking.deleteMany();
    await prisma.userPackage.deleteMany();
    await prisma.class.deleteMany();
    await prisma.package.deleteMany();
    await prisma.user.deleteMany();

    // Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@pilates.com',
            password: adminPassword,
            name: 'Studio Manager',
            role: 'ADMIN',
        },
    });

    // Create Trainer
    const trainerPassword = await bcrypt.hash('trainer123', 10);
    const trainer = await prisma.user.create({
        data: {
            email: 'trainer@pilates.com',
            password: trainerPassword,
            name: 'Jane Pilates',
            role: 'TRAINER',
            avatar: 'https://i.pravatar.cc/150?u=trainer',
        },
    });

    // Create Customer
    const customerPassword = await bcrypt.hash('user123', 10);
    const customer = await prisma.user.create({
        data: {
            email: 'user@example.com',
            password: customerPassword,
            name: 'Alice Member',
            role: 'CUSTOMER',
        },
    });

    // Create Packages
    const pkgGroup10 = await prisma.package.create({
        data: {
            name: '10 Grup Dersi',
            type: 'GROUP',
            credits: 10,
            price: 2500,
            validityDays: 90,
            description: '3 ay geçerli 10 lu grup reformer paketi',
        },
    });

    const pkgPrivate5 = await prisma.package.create({
        data: {
            name: '5 Özel Ders',
            type: 'PRIVATE',
            credits: 5,
            price: 4000,
            validityDays: 60,
            description: 'Birebir özel ders paketi',
        },
    });

    // Assign Package to Customer
    await prisma.userPackage.create({
        data: {
            userId: customer.id,
            packageId: pkgGroup10.id,
            remainingCredits: 8, // Used 2
            startDate: new Date(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
    });

    // Create Classes
    const today = new Date();
    today.setHours(10, 0, 0, 0);

    await prisma.class.create({
        data: {
            name: 'Sabah Reformer',
            trainerId: trainer.id,
            startTime: today,
            endTime: new Date(today.getTime() + 60 * 60 * 1000),
            capacity: 6,
            type: 'GROUP',
        },
    });

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);

    await prisma.class.create({
        data: {
            name: 'Akşam Mat Pilates',
            trainerId: trainer.id,
            startTime: tomorrow,
            endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000),
            capacity: 8,
            type: 'GROUP',
        },
    });

    console.log('Seed completed!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
