import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import WeeklySchedule from '@/components/dashboard/WeeklySchedule';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import { getDashboardStatsAction } from '@/app/actions/stats';
import Link from 'next/link';
import UpcomingBookings from '@/components/dashboard/UpcomingBookings';

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const user = session.user;

    // --- ADMIN DATA ---
    let adminStats: any = null;
    let quickStats = { members: 0, activePackages: 0 };

    if (user.role === 'ADMIN') {
        adminStats = await getDashboardStatsAction();
        quickStats.members = await prisma.user.count({ where: { role: 'CUSTOMER' } });
        quickStats.activePackages = await prisma.userPackage.count({ where: { isActive: true } });
    }

    // --- CUSTOMER DATA ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let activePackages: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let customerBookings: any[] = [];

    if (user.role === 'CUSTOMER') {
        activePackages = await prisma.userPackage.findMany({
            where: { userId: user.id, isActive: true },
            include: { package: true },
        });

        customerBookings = await prisma.booking.findMany({
            where: {
                userId: user.id,
                status: 'CONFIRMED',
                class: { startTime: { gte: new Date() } }
            },
            include: { class: { include: { trainer: true } } },
            orderBy: { class: { startTime: 'asc' } },
            take: 3,
        });
    }

    // --- TRAINER DATA ---
    let trainerStats = { upcomingClasses: 0, totalStudents: 0 };
    if (user.role === 'TRAINER') {
        trainerStats.upcomingClasses = await prisma.class.count({
            where: {
                trainerId: user.id,
                startTime: { gte: new Date() }
            }
        });

        // Count bookings in my upcoming classes
        const myClasses = await prisma.class.findMany({
            where: { trainerId: user.id },
            select: { _count: { select: { bookings: true } } }
        });

        // Summing up all bookings history (or just upcoming? "Kaç dersi/öğrencisi olduğunu" suggests workload)
        // Let's count total bookings ever for this trainer to show popularity/impact
        trainerStats.totalStudents = myClasses.reduce((acc, curr) => acc + curr._count.bookings, 0);
    }

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontWeight: '300', fontSize: '2rem' }}>Merhaba, <span style={{ fontWeight: '600' }}>{user.name}</span> 👋</h1>
                <p style={{ opacity: 0.6 }}>
                    {user.role === 'ADMIN' ? 'Stüdyo Yönetim Paneli' : 'Bugün kendini nasıl hissediyorsun?'}
                </p>
            </header>

            {/* --- ADMIN VIEW --- */}
            {user.role === 'ADMIN' && (
                <div>
                    <div className="grid-responsive" style={{ marginBottom: '2rem' }}>
                        <div className="card">
                            <h3>Toplam Üye</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{quickStats.members}</p>
                        </div>
                        <div className="card">
                            <h3>Aktif Paketler</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{quickStats.activePackages}</p>
                        </div>
                        {adminStats && (
                            <div className="card">
                                <h3>Toplam Gelir</h3>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-success) || green' }}>
                                    {adminStats.totalIncome.toLocaleString('tr-TR')} ₺
                                </p>
                            </div>
                        )}
                        <div className="card" style={{ background: 'var(--color-primary)', color: 'white' }}>
                            <h3>Hızlı İşlem</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                <Link href="/dashboard/users" className="btn" style={{ background: 'white', color: 'var(--color-primary)', border: 'none', fontSize: '0.8rem' }}>Üye Ekle</Link>
                                <Link href="/dashboard/schedule" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', fontSize: '0.8rem' }}>Ders Ekle</Link>
                                <Link href="/dashboard/videos" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', fontSize: '0.8rem' }}>Video Ekle</Link>
                            </div>
                        </div>
                    </div>

                    {adminStats && <DashboardCharts data={adminStats} />}
                </div>
            )}

            {/* --- CUSTOMER VIEW --- */}
            {user.role === 'CUSTOMER' && (
                <div className="grid-responsive">
                    <div className="card animate-fade-in">
                        <h2 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Paket Durumu</h2>
                        {activePackages.length === 0 ? (
                            <p>Aktif paketiniz bulunmuyor.</p>
                        ) : (
                            activePackages.map(up => (
                                <div key={up.id} style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                                    <div style={{ fontWeight: '600' }}>{up.package.name}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                        <span>Kalan: <b style={{ color: 'var(--color-primary)' }}>{up.remainingCredits}</b></span>
                                        <span style={{ opacity: 0.7 }}>Bitiş: {up.endDate ? new Date(up.endDate).toLocaleDateString('tr-TR') : '-'}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <UpcomingBookings bookings={customerBookings} />

                    <div className="card animate-fade-in" style={{ animationDelay: '0.2s', background: 'var(--color-primary)', color: 'white' }}>
                        <h2 style={{ marginBottom: '0.5rem' }}>Hemen Rezervasyon Yap</h2>
                        <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>Kendine bir iyilik yap ve bugünü planla.</p>
                        <Link href="/dashboard/book" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                            Ders Programını İncele
                        </Link>
                    </div>
                </div>
            )}

            {/* --- TRAINER VIEW --- */}
            {user.role === 'TRAINER' && (
                <div className="grid-responsive">
                    <div className="card">
                        <h3>Yaklaşan Derslerim</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                            {trainerStats.upcomingClasses}
                        </p>
                    </div>
                    <div className="card">
                        <h3>Toplam Öğrenci/Katılım</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                            {trainerStats.totalStudents}
                        </p>
                    </div>
                </div>
            )}

            <h2 style={{ margin: '3rem 0 1rem 0' }}>Haftalık Program</h2>
            <WeeklySchedule />
        </div>
    );
}
