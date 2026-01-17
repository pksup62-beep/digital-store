import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import DeleteProductButton from '@/components/DeleteProductButton';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Admin Dashboard Page
export default async function AdminDashboard() {
    const session = await auth();

    // Secure Role Check
    if (session?.user?.role !== 'ADMIN') {
        redirect('/'); // Or to a 403 page
    }

    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <main>
            <div className="container" style={{ paddingTop: '8rem', paddingBottom: '5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <h1>Admin Dashboard</h1>
                    <Link href="/admin/product/new" className="btn-primary" style={{ textDecoration: 'none' }}>
                        + Add New Course
                    </Link>
                </div>

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
