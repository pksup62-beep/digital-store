import { auth } from '@/auth';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function MyCourses() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    const orders = await prisma.order.findMany({
        where: {
            userId: session.user.id,
            status: 'SUCCESS'
        },
        include: { product: true }
    });

    return (
        <main>
            <div className="container" style={{ paddingTop: '8rem', paddingBottom: '5rem' }}>
                <h1 style={{ marginBottom: '3rem' }}>My Library</h1>

                {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem' }}>
                        <h2>No courses yet</h2>
                        <p>You haven't purchased any courses yet.</p>
                        <Link href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>
                            Browse Store
                        </Link>
                    </div>
                ) : (
                    <div className="products-grid">
                        {orders.map((order) => (
                            <div key={order.id} className="glass-panel product-card">
                                <div className="card-image">
                                    <img src={order.product.thumbnail} alt={order.product.title} />
                                </div>
                                <div className="card-content">
                                    <h3>{order.product.title}</h3>
                                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                        <a
                                            href={order.product.pdfUrl}
                                            download
                                            className="btn-primary btn-full"
                                            style={{ background: 'hsl(var(--primary))', color: 'black', textDecoration: 'none' }}
                                        >
                                            Download PDF
                                        </a>
                                        <Link
                                            href={`/product/${order.product.id}`}
                                            style={{ display: 'block', textAlign: 'center', marginTop: '0.5rem', fontSize: '0.875rem', color: '#888' }}
                                        >
                                            Watch Videos
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
