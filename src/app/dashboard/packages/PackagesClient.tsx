'use client';

import { useState } from 'react';
import PackageForm from './PackageForm';
import { deletePackageAction } from '@/app/actions/admin';
import { buyPackageAction } from '@/app/actions/commerce';

interface PackagesClientProps {
    packages: any[];
    myPackages?: any[];
    role: string;
}

export default function PackagesClient({ packages, myPackages = [], role }: PackagesClientProps) {
    const [view, setView] = useState<'LIST' | 'CREATE' | 'EDIT'>('LIST');
    const [selectedPackage, setSelectedPackage] = useState<any>(null);

    const handleEdit = (pkg: any) => {
        setSelectedPackage(pkg);
        setView('EDIT');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu paketi silmek istediğinize emin misiniz?')) return;
        const res = await deletePackageAction(id);
        if (res.success) {
            alert(res.message);
        } else {
            alert('Hata: ' + res.message);
        }
    };

    const handleBuy = async (id: string) => {
        if (!confirm('Bu paketi satın almak istiyor musunuz? (Demo: Kredi kartı gerekmez)')) return;
        const res = await buyPackageAction(id);
        if (res.success) {
            alert(res.message);
        } else {
            alert('Hata: ' + res.message);
        }
    };

    if (view === 'CREATE') {
        return <PackageForm onCancel={() => setView('LIST')} onSuccess={() => setView('LIST')} />;
    }

    if (view === 'EDIT') {
        return <PackageForm pkg={selectedPackage} onCancel={() => setView('LIST')} onSuccess={() => setView('LIST')} />;
    }

    return (
        <div>
            {role === 'CUSTOMER' && myPackages.length > 0 && (
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
                <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Tüm Paketler</h1>
                {role === 'ADMIN' && (
                    <button onClick={() => setView('CREATE')} className="btn btn-primary">
                        Yeni Paket Oluştur
                    </button>
                )}
            </div>

            <div className="grid-responsive">
                {packages.map(pkg => (
                    <div key={pkg.id} className="card" style={{ display: 'flex', flexDirection: 'column', opacity: pkg.active ? 1 : 0.6 }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.4rem' }}>{pkg.name}</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <span style={{ padding: '4px 8px', background: 'var(--color-secondary)', borderRadius: '4px', fontSize: '0.8rem' }}>
                                    {pkg.type === 'GROUP' ? 'Grup Dersi' : 'Özel Ders'}
                                </span>
                                {!pkg.active && (
                                    <span style={{ padding: '4px 8px', background: '#e2e8f0', borderRadius: '4px', fontSize: '0.8rem' }}>
                                        Pasif
                                    </span>
                                )}
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

                        {role === 'ADMIN' ? (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => handleEdit(pkg)} className="btn btn-outline" style={{ flex: 1 }}>Düzenle</button>
                                <button onClick={() => handleDelete(pkg.id)} className="btn btn-outline" style={{ flex: 1, borderColor: 'var(--color-error)', color: 'var(--color-error)' }}>Sil</button>
                            </div>
                        ) : (
                            <button onClick={() => handleBuy(pkg.id)} disabled={!pkg.active} className="btn btn-primary" style={{ width: '100%' }}>
                                {pkg.active ? 'Satın Al' : 'Satışa Kapalı'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
