import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';

const verifyPaymentSchema = z.object({
    razorpay_order_id: z.string().min(1),
    razorpay_payment_id: z.string().min(1),
    razorpay_signature: z.string().min(1),
    productId: z.string().min(1)
});

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const result = verifyPaymentSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, productId } = result.data;
        const key_secret = process.env.RAZORPAY_KEY_SECRET!;

        // Verify Signature
        const generated_signature = crypto
            .createHmac('sha256', key_secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid Payment Signature' }, { status: 400 });
        }

        // Payment Successful - Create Order
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        // Check if order already exists (optional idempotency)
        // For now, allow multiple buys or simple create.

        await prisma.order.create({
            data: {
                userId: session.user.id,
                productId: productId,
                amount: product.price, // Store in cents/paise as per schema
                status: 'COMPLETED',
                transactionId: razorpay_payment_id
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Razorpay Verify Error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
