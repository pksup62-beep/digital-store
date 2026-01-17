import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/ProductForm';
import { redirect } from 'next/navigation';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') redirect('/');

    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) redirect('/admin');

    return (
        <main className="container" style={{ paddingTop: '8rem', paddingBottom: '5rem', maxWidth: '600px' }}>
            <h1 style={{ marginBottom: '2rem' }}>Edit Course</h1>
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem' }}>
                <ProductForm initialData={product} isEdit={true} />
            </div>
        </main>
    );
}
