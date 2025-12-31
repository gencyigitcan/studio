'use client';

import { useState } from 'react';
import { createDiscountAction } from '@/app/actions/features';

export default function DiscountManager({ discounts }: { discounts: any[] }) {
    const [isAdding, setIsAdding] = useState(false);

    async function handleCreate(formData: FormData) {
        const res = await createDiscountAction(formData);
        alert(res.message);
        if (res.success) setIsAdding(false);
    }

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Kampanya & İndirim Kodları</h3>
                <button onClick={() => setIsAdding(!isAdding)} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
                    {isAdding ? 'İptal' : 'Yeni Kod Oluştur'}
                </button>
            </div>

            {isAdding && (
                <form action={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                    <input name="code" placeholder="KOD (Örn: SUMMER20)" className="input" required style={{ textTransform: 'uppercase' }} />
                    <input name="percentage" type="number" placeholder="Yüzde İndirim (%)" className="input" />
                    <input name="amount" type="number" placeholder="Tutar İndirimi (TL)" className="input" />
                    <input name="usageLimit" type="number" placeholder="Kullanım Limiti" className="input" />
                    <div>
                        <label style={{ fontSize: '0.8rem' }}>Başlangıç</label>
                        <input name="startDate" type="date" className="input" style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem' }}>Bitiş</label>
                        <input name="endDate" type="date" className="input" style={{ width: '100%' }} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>Oluştur</button>
                </form>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ background: '#f1f1f1' }}>
                            <th style={{ padding: '0.5rem', textAlign: 'left' }}>Kod</th>
                            <th>İndirim</th>
                            <th>Limit</th>
                            <th>Kullanılan</th>
                            <th>Durum</th>
                        </tr>
                    </thead>
                    <tbody>
                        {discounts.map(d => (
                            <tr key={d.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{d.code}</td>
                                <td>{d.percentage ? `%${d.percentage}` : `${d.amount} TL`}</td>
                                <td>{d.usageLimit || 'Sınırsız'}</td>
                                <td>{d.usedCount}</td>
                                <td>
                                    <span style={{
                                        padding: '2px 6px', borderRadius: '4px',
                                        background: d.isActive ? '#10b981' : '#ef4444',
                                        color: 'white', fontSize: '0.7rem'
                                    }}>
                                        {d.isActive ? 'Aktif' : 'Pasif'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {discounts.length === 0 && <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center', opacity: 0.6 }}>Aktif kupon yok.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
