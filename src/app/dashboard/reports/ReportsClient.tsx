'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsClient({ data }: { data: any }) {
    return (
        <div className="grid-responsive">
            {/* KPI Cards */}
            <div className="card" style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#666', fontSize: '0.9rem', textTransform: 'uppercase' }}>Doluluk Oranı</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    %{data.occupancyRate.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Bu Ay</div>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#666', fontSize: '0.9rem', textTransform: 'uppercase' }}>No-Show Oranı</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                    %{data.noShowRate.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Toplam</div>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#666', fontSize: '0.9rem', textTransform: 'uppercase' }}>Toplam Rezervasyon</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {data.totalBookings}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>/ {data.totalCapacity} Kapasite</div>
            </div>

            {/* Chart */}
            <div className="card" style={{ gridColumn: '1 / -1' }}>
                <h3>Günlük Rezervasyon Trendi</h3>
                <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Trainers */}
            <div className="card" style={{ gridColumn: '1 / -1' }}>
                <h3>En İyi Eğitmenler</h3>
                <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', fontSize: '0.9rem', borderBottom: '1px solid #e5e7eb' }}>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Eğitmen</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Puan</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Değerlendirme Sayısı</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.topTrainers.map((t: any) => (
                                <tr key={t.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '32px', height: '32px', background: '#eee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {t.user.name.charAt(0)}
                                            </div>
                                            {t.user.name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.75rem', color: '#f59e0b', fontWeight: 'bold' }}>
                                        ★ {t.rating.toFixed(1)}
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>
                                        {t.ratingCount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
