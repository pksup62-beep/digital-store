'use client';

import ProductForm from '@/components/ProductForm';

export default function NewProductPage() {
    return (
        <main className="container" style={{ paddingTop: '8rem', paddingBottom: '5rem', maxWidth: '600px' }}>
            <h1 style={{ marginBottom: '2rem' }}>Add New Course</h1>

            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem' }}>
                <ProductForm />
            </div>
        </main>
    );
}
