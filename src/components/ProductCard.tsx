import Link from 'next/link';
import { Product } from '@/lib/data';

export default function ProductCard({ product }: { product: Product }) {
    return (
        <Link href={`/product/${product.id}`} style={{ display: 'block', textDecoration: 'none' }}>
            <div className="glass-panel product-card">
                <div className="card-image">
                    <img
                        src={product.thumbnail}
                        alt={product.title}
                    />
                </div>

                <div className="card-content">
                    <h3 style={{ marginBottom: '0.5rem' }}>{product.title}</h3>
                    <p style={{ fontSize: '0.9rem', marginBottom: '1rem', flex: 1 }}>
                        {product.description}
                    </p>

                    <div className="card-footer">
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>₹{product.price}</span>
                        <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Instant Access
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
