'use client';

import { useState } from 'react';
import { createMeasurementAction, deleteMeasurementAction } from '@/app/actions/measurement';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MeasurementClientProps {
    students?: any[]; // For Trainer to select
    measurements: any[]; // History
    role: string;
    targetStudentId?: string; // If viewing specific student
}

export default function MeasurementClient({ students, measurements, role }: MeasurementClientProps) {
    const [selectedStudent, setSelectedStudent] = useState<string>('');
    const [isAdding, setIsAdding] = useState(false);

    // Filter measurements for chart if a student is selected (or if customer is viewing own)
    const filteredMeasurements = role === 'CUSTOMER'
        ? measurements
        : (selectedStudent ? measurements.filter(m => m.userId === selectedStudent) : []);

    // Sort by date asc for chart
    const chartData = [...filteredMeasurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(m => ({
        ...m,
        dateFormatted: new Date(m.date).toLocaleDateString()
    }));

    async function handleSubmit(formData: FormData) {
        const res = await createMeasurementAction(formData);
        if (res.success) {
            alert(res.message);
            setIsAdding(false);
        } else {
            alert(res.message);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Silmek istiyor musunuz?')) return;
        await deleteMeasurementAction(id);
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem' }}>Gelişim Takibi</h1>
                {role !== 'CUSTOMER' && (
                    <button onClick={() => setIsAdding(!isAdding)} className="btn btn-primary">
                        {isAdding ? 'İptal' : 'Yeni Ölçüm Ekle'}
                    </button>
                )}
            </div>

            {/* Trainer Selection Area */}
            {role !== 'CUSTOMER' && (
                <div style={{ marginBottom: '2rem' }}>
                    <select
                        className="input"
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        value={selectedStudent}
                    >
                        <option value="">Öğrenci Seçin...</option>
                        {students?.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Add Form */}
            {isAdding && role !== 'CUSTOMER' && (
                <div className="card" style={{ marginBottom: '2rem', maxWidth: '600px' }}>
                    <h3>Ölçüm Ekle</h3>
                    <form action={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label>Öğrenci</label>
                            <select name="userId" className="input" defaultValue={selectedStudent} required style={{ width: '100%' }}>
                                <option value="">Seçiniz...</option>
                                {students?.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label>Tarih</label>
                            <input type="date" name="date" className="input" required defaultValue={new Date().toISOString().split('T')[0]} style={{ width: '100%' }} />
                        </div>
                        <div>
                            <label>Kilo (kg)</label>
                            <input type="number" step="0.1" name="weight" className="input" style={{ width: '100%' }} />
                        </div>
                        <div>
                            <label>Yağ Oranı (%)</label>
                            <input type="number" step="0.1" name="fatRatio" className="input" style={{ width: '100%' }} />
                        </div>
                        <div>
                            <label>Bel (cm)</label>
                            <input type="number" step="0.1" name="waist" className="input" style={{ width: '100%' }} />
                        </div>
                        <div>
                            <label>Basen (cm)</label>
                            <input type="number" step="0.1" name="hips" className="input" style={{ width: '100%' }} />
                        </div>
                        <div>
                            <label>Kol (cm)</label>
                            <input type="number" step="0.1" name="arm" className="input" style={{ width: '100%' }} />
                        </div>
                        <div>
                            <label>Bacak (cm)</label>
                            <input type="number" step="0.1" name="leg" className="input" style={{ width: '100%' }} />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Kaydet</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Charts View */}
            {(selectedStudent || role === 'CUSTOMER') && chartData.length > 0 ? (
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Değişim Grafiği</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="dateFormatted" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="weight" stroke="#8884d8" fill="#8884d8" name="Kilo" />
                                <Area type="monotone" dataKey="fatRatio" stroke="#82ca9d" fill="#82ca9d" name="Yağ %" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                (selectedStudent || role === 'CUSTOMER') && <p>Kayıtlı ölçüm bulunamadı.</p>
            )}

            {/* History Table */}
            {(selectedStudent || role === 'CUSTOMER') && chartData.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <h3>Ölçüm Geçmişi</h3>
                    <div className="card" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                    <th style={{ padding: '0.5rem' }}>Tarih</th>
                                    <th>Kilo</th>
                                    <th>Yağ %</th>
                                    <th>Bel</th>
                                    <th>Basen</th>
                                    {role !== 'CUSTOMER' && <th>İşlemler</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.map(m => (
                                    <tr key={m.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                        <td style={{ padding: '0.5rem' }}>{m.dateFormatted}</td>
                                        <td>{m.weight}</td>
                                        <td>{m.fatRatio}</td>
                                        <td>{m.waist}</td>
                                        <td>{m.hips}</td>
                                        {role !== 'CUSTOMER' && (
                                            <td>
                                                <button onClick={() => handleDelete(m.id)} style={{ color: 'red', border: 'none', background: 'none' }}>Sil</button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
