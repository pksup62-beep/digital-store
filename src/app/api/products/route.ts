import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const productSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    price: z.coerce.number().min(0),
    thumbnail: z.string().min(1), // Allow relative paths
    pdfUrl: z.string().min(1),    // Allow relative paths
    videoUrl: z.string().url(),   // YouTube embed still needs to be valid URL
    features: z.string(),
    category: z.string().min(1)
});

export async function POST(req: Request) {
    try {
        const session = await auth();

        // rigorous role check
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();

        const result = productSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: result.data
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Product creation failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
