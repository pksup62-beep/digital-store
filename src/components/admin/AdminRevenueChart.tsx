'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface ChartProps {
    data: {
        name: string;
        revenue: number;
        sales: number;
    }[];
}

export default function AdminRevenueChart({ data }: ChartProps) {
    if (!data || data.length === 0) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No sales data available yet.</div>;
    }

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
