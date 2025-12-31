import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding heavy data...');

    // 1. Clean up existing data (Optional, but good for reliable test)
    // Warning: This deletes everything.
    // await prisma.booking.deleteMany();
    // await prisma.class.deleteMany();
    // await prisma.userPackage.deleteMany();
    // await prisma.user.deleteMany({ where: { role: { not: 'ADMIN' } } }); 

    const password = await hash('123456', 12);

    // 2. Create 5 Trainers
    const trainers = [];
    for (let i = 1; i <= 5; i++) {
        const trainer = await prisma.user.create({
            data: {
                name: `Eğitmen ${i}`,
                email: `trainer${i}@pilates.com`,
                password,
                role: 'TRAINER',
            },
        });
        trainers.push(trainer);
        console.log(`Created Trainer: ${trainer.name}`);
    }

    // 3. Create 100 Students
    const students = [];
    for (let i = 1; i <= 100; i++) {
        const student = await prisma.user.create({
            data: {
                name: `Öğrenci ${i} Yılmaz`,
                email: `student${i}@test.com`,
                password,
                role: 'CUSTOMER',
            },
        });
        students.push(student);
    }
    console.log('Created 100 Students.');

    // 4. Assign Packages to 80 Students
    const pkg = await prisma.package.findFirst(); // Assume at least one package exists from previous seed
    if (pkg) {
        for (let i = 0; i < 80; i++) {
            await prisma.userPackage.create({
                data: {
                    userId: students[i].id,
                    packageId: pkg.id,
                    remainingCredits: 10,
                    isActive: true,
                    startDate: new Date(),
                    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
                }
            })
        }
        console.log('Assigned packages to 80 students.');
    }

    // 5. Create Classes (Next 2 weeks, morning/evening slots)
    const classes = [];
    const startDay = new Date();
    startDay.setHours(0, 0, 0, 0);

    for (let d = 0; d < 14; d++) {
        const currentDay = new Date(startDay);
        currentDay.setDate(startDay.getDate() + d);

        // 4 classes per day
        const times = [9, 12, 17, 19]; // 09:00, 12:00, 17:00, 19:00

        for (const t of times) {
            const startTime = new Date(currentDay);
            startTime.setHours(t, 0, 0, 0);
            const endTime = new Date(startTime);
            endTime.setHours(t + 1);

            // Random trainer
            const trainer = trainers[Math.floor(Math.random() * trainers.length)];

            const cls = await prisma.class.create({
                data: {
                    name: t === 9 ? 'Morning Pilates' : t === 19 ? 'Evening Flow' : 'Reformer Class',
                    trainerId: trainer.id,
                    capacity: 10,
                    startTime,
                    endTime,
                    status: 'SCHEDULED',
                    type: 'GROUP'
                }
            });
            classes.push(cls);
        }
    }
    console.log(`Created ${classes.length} classes.`);

    // 6. Create Random Bookings
    // Distribute bookings among classes. Some classes full, some empty.
    let bookingCount = 0;
    for (const cls of classes) {
        // Random occupancy 0 to 10
        const occupancy = Math.floor(Math.random() * 11);

        // Shuffle students to pick random unique attendees
        const shuffledStudents = students.sort(() => 0.5 - Math.random()).slice(0, occupancy);

        for (const s of shuffledStudents) {
            await prisma.booking.create({
                data: {
                    userId: s.id,
                    classId: cls.id,
                    status: 'CONFIRMED'
                }
            });
            bookingCount++;
        }
    }
    console.log(`Created ${bookingCount} bookings.`);
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
