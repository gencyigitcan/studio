import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function PackagesPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const packages = await prisma.package.findMany({
        where: { active: true },
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
        <div>
            <h1 style={{ marginBottom: '2rem', fontSize: '1.8rem' }}>Paketler</h1>

            {user.role === 'CUSTOMER' && myPackages.length > 0 && (
                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Paketlerim</h2>
                    <div className="grid-responsive">
                        {myPackages.map(up => (
                            <div key={up.id} className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                                <h3>{up.package.name}</h3>
                                <p style={{ margin: '0.5rem 0', opacity: 0.8 }}>Kalan Hak: <strong>{up.remainingCredits}</strong></p>
                                <p style={{ fontSize: '0.9rem', opacity: 0.6 }}>Bitiş: {up.endDate ? new Date(up.endDate).toLocaleDateString() : 'Süresiz'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Tüm Paketler</h2>
                {user.role === 'ADMIN' && <button className="btn btn-primary">Yeni Paket Oluştur</button>}
            </div>

            <div className="grid-responsive">
                {packages.map(pkg => (
                    <div key={pkg.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.4rem' }}>{pkg.name}</h3>
                            <div style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                background: 'var(--color-secondary)',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                marginTop: '0.5rem'
                            }}>
                                {pkg.type === 'GROUP' ? 'Grup Dersi' : 'Özel Ders'}
                            </div>
                        </div>

                        <p style={{ opacity: 0.7, marginBottom: '1.5rem', flex: 1 }}>{pkg.description}</p>

                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '1rem' }}>
                            {Number(pkg.price).toLocaleString('tr-TR')} ₺
                        </div>

                        <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                            <span>✨ {pkg.credits} Ders Hakkı</span>
                            <span>📅 {pkg.validityDays} Gün Geçerli</span>
                        </div>

                        {user.role === 'ADMIN' ? (
                            <button className="btn btn-outline" style={{ width: '100%' }}>Düzenle</button>
                        ) : (
                            <button className="btn btn-primary" style={{ width: '100%' }}>Satın Al</button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
