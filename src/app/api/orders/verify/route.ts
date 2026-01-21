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

        const order = await prisma.order.create({
            data: {
                userId: session.user.id,
                productId: productId,
                amount: product.price, // Store in cents/paise as per schema
                status: 'COMPLETED',
                transactionId: razorpay_payment_id
            }
        });

        // Send Email Receipt (Async - don't block response)
        const origin = new URL(req.url).origin;
        const productUrl = `${origin}/product/${productId}`;

        // We use setImmediate or just don't await strictly to speed up response, 
        // but Vercel serverless might kill process. Safe to await or use waitUntil if available (Next 15+ has after/waitUntil).
        // For standard Next App Router, await is safest to ensure delivery.
        try {
            if (session.user.email) {
                const { sendReceiptEmail } = await import('@/lib/mail');
                await sendReceiptEmail({
                    email: session.user.email,
                    orderId: order.id,
                    productName: product.title,
                    amount: product.price,
                    date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
                    productUrl
                });
            }
        } catch (emailError) {
            console.error('Email sending failed (non-blocking):', emailError);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Razorpay Verify Error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
