import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import DeleteProductButton from '@/components/DeleteProductButton';
import AdminRevenueChart from '@/components/admin/AdminRevenueChart';
import { redirect } from 'next/navigation';
import { DollarSign, ShoppingBag, Users as UsersIcon, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

// Admin Dashboard Page
export default async function AdminDashboard() {
    const session = await auth();

    if (session?.user?.role !== 'ADMIN') {
        redirect('/');
    }

    // Parallel Data Fetching
    const [products, totalRevenueData, totalOrders, uniqueCustomers, productPerformance] = await Promise.all([
        prisma.product.findMany({ orderBy: { createdAt: 'desc' } }),
        prisma.order.aggregate({
            _sum: { amount: true },
            where: { status: 'COMPLETED' }
        }),
        prisma.order.count({ where: { status: 'COMPLETED' } }),
        prisma.order.groupBy({
            by: ['userId'],
            where: { status: 'COMPLETED' }
        }),
        prisma.order.groupBy({
            by: ['productId'],
            _sum: { amount: true },
            _count: { id: true },
            where: { status: 'COMPLETED' }
        })
    ]);

    // Format Chart Data
    const chartData = await Promise.all(productPerformance.map(async (item) => {
        const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { title: true }
        });
        return {
            name: product?.title || 'Unknown',
            revenue: item._sum.amount || 0,
            sales: item._count.id
        };
    }));

    const totalRevenue = totalRevenueData._sum.amount || 0;
    const customerCount = uniqueCustomers.length;

    return (
        <main>
            <div className="container" style={{ paddingTop: '8rem', paddingBottom: '5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1>Admin Dashboard</h1>
                    <Link href="/admin/product/new" className="btn-primary" style={{ textDecoration: 'none' }}>
                        + Add New Course
                    </Link>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    <StatCard
                        title="Total Revenue"
                        value={`₹${totalRevenue.toLocaleString()}`}
                        icon={<DollarSign size={24} color="#22c55e" />}
                    />
                    <StatCard
                        title="Total Orders"
                        value={totalOrders.toString()}
                        icon={<ShoppingBag size={24} color="#3b82f6" />}
                    />
                    <StatCard
                        title="Customers"
                        value={customerCount.toString()}
                        icon={<UsersIcon size={24} color="#a855f7" />}
                    />
                </div>

                {/* Charts Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '3rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingUp size={20} /> Revenue by Course
                        </h3>
                        <AdminRevenueChart data={chartData} />
                    </div>
                </div>

                {/* Recent Products */}
                <h3 style={{ marginBottom: '1rem' }}>Manage Products ({products.length})</h3>
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '1rem', color: '#888', fontWeight: 500 }}>Title</th>
                                <th style={{ padding: '1rem', color: '#888', fontWeight: 500 }}>Price</th>
                                <th style={{ padding: '1rem', color: '#888', fontWeight: 500 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <img
                                                src={product.thumbnail}
                                                alt=""
                                                style={{ width: '40px', height: '40px', borderRadius: '0.25rem', objectFit: 'cover' }}
                                            />
                                            {product.title}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>₹{product.price}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Link
                                                href={`/admin/product/edit/${product.id}`}
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    background: 'rgba(255,255,255,0.1)',
                                                    borderRadius: '0.25rem',
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                Edit
                                            </Link>
                                            <DeleteProductButton id={product.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}>
                {icon}
            </div>
            <div>
                <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{title}</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</h3>
            </div>
        </div>
    );
}
