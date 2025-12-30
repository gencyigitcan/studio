import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

async function CustomerDashboard({ userId }: { userId: string }) {
    const activePackages = await prisma.userPackage.findMany({
        where: { userId, isActive: true },
        include: { package: true },
    });

    const upcomingBookings = await prisma.booking.findMany({
        where: {
            userId,
            status: 'CONFIRMED',
            class: { startTime: { gte: new Date() } }
        },
        include: { class: { include: { trainer: true } } },
        orderBy: { class: { startTime: 'asc' } },
        take: 3,
    });

    return (
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

            <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h2 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Yaklaşan Dersler</h2>
                {upcomingBookings.length === 0 ? (
                    <p>Yaklaşan rezervasyonunuz yok.</p>
                ) : (
                    upcomingBookings.map(booking => (
                        <div key={booking.id} style={{ marginBottom: '0.8rem', padding: '0.8rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ fontWeight: '600' }}>{booking.class.name}</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                                {new Date(booking.class.startTime).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                <br />
                                {new Date(booking.class.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                {' - '}
                                {booking.class.trainer.name}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="card animate-fade-in" style={{ animationDelay: '0.2s', background: 'var(--color-primary)', color: 'white' }}>
                <h2 style={{ marginBottom: '0.5rem' }}>Hemen Rezervasyon Yap</h2>
                <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>Kendine bir iyilik yap ve bugünü planla.</p>
                <a href="/dashboard/book" className="btn btn-secondary" style={{ width: '100%' }}>
                    Ders Programını İncele
                </a>
            </div>
        </div>
    );
}

async function AdminDashboard() {
    const stats = {
        users: await prisma.user.count({ where: { role: 'CUSTOMER' } }),
        activeBookings: await prisma.booking.count({ where: { status: 'CONFIRMED', class: { startTime: { gte: new Date() } } } }),
        todayClasses: await prisma.class.count({
            where: {
                startTime: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    lt: new Date(new Date().setHours(23, 59, 59, 999))
                }
            }
        })
    };

    return (
        <div className="grid-responsive">
            <div className="card animate-fade-in">
                <h3>Toplam Üye</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{stats.users}</div>
            </div>
            <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h3>Aktif Rezervasyon</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{stats.activeBookings}</div>
            </div>
            <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h3>Bugünkü Dersler</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{stats.todayClasses}</div>
            </div>

            <div className="card animate-fade-in" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                <h3>Hızlı İşlemler</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    <a href="/dashboard/users" className="btn btn-outline">Üye Ekle (Manuel)</a>
                    <a href="/dashboard/schedule" className="btn btn-outline">Ders Programı</a>
                    <a href="/dashboard/packages" className="btn btn-outline">Paket Yönetimi</a>
                </div>
            </div>
        </div>
    );
}

import WeeklySchedule from '@/components/dashboard/WeeklySchedule';

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const user = session.user;

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontWeight: '300', fontSize: '2rem' }}>Merhaba, <span style={{ fontWeight: '600' }}>{user.name}</span></h1>
                <p style={{ opacity: 0.6 }}>Bugün kendini nasıl hissediyorsun?</p>
            </header>

            {user.role === 'CUSTOMER' && <CustomerDashboard userId={user.id} />}
            {user.role === 'ADMIN' && <AdminDashboard />}
            {user.role === 'TRAINER' && <div className="card">Eğitmen paneli hazırlanıyor...</div>}

            <WeeklySchedule />
        </div>
    );
}
