import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';

import VideoPlayer from '@/components/VideoPlayer';
import PaymentModal from '@/components/PaymentModal';
import { prisma } from '@/lib/prisma';
import ProductPageClient from './client';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    return {
        title: product.title,
        description: product.description.substring(0, 160), // standard SEO length
        openGraph: {
            title: product.title,
            description: product.description,
            images: [
                {
                    url: product.thumbnail,
                    width: 1200,
                    height: 630,
                    alt: product.title,
                }
            ],
            type: 'website',
        },
    };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();

    const product = await prisma.product.findUnique({
        where: { id }
    });

    if (!product) {
        notFound();
    }

    // Check if user has purchased this product
    let isPurchased = false;
    if (session?.user?.id) {
        const order = await prisma.order.findFirst({
            where: {
                userId: session.user.id,
                productId: id,
                status: 'SUCCESS'
            }
        });
        if (order) isPurchased = true;
    }

    // Parse features if stored as JSON string (from seed)
    let features = [];
    try {
        features = JSON.parse(product.features);
    } catch (e) {
        features = [product.features];
    }

    return (
        <main style={{ minHeight: '100vh', paddingBottom: '5rem' }}>
            <ProductPageClient
                product={{ ...product, features }}
                isPurchased={isPurchased}
                userId={session?.user?.id}
            />
        </main>
    );
}
