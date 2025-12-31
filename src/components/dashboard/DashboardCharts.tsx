'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardChartsProps {
    data: {
        totalIncome: number;
        chartData: any[]; // { name: string, income: number }
        packageStats: any[]; // { name: string, value: number }
    }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardCharts({ data }: DashboardChartsProps) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
            {/* Income Chart */}
            <div className="card" style={{ minHeight: '400px' }}>
                <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Aylık Gelir Dağılımı</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="income" fill="var(--color-primary)" name="Gelir (₺)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Package Sales Pie Chart */}
            <div className="card" style={{ minHeight: '400px' }}>
                <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Paket Satış Oranları</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data.packageStats}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }: any) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.packageStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
