import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendReceiptEmail } from '@/lib/mail';

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-razorpay-signature');

        if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
            console.error('RAZORPAY_WEBHOOK_SECRET is not defined');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        // Verify Signature
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(body)
            .digest('hex');

        if (generated_signature !== signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const event = JSON.parse(body);

        // Handle 'order.paid'
        if (event.event === 'order.paid') {
            const payment = event.payload.payment.entity;
            const order_id = payment.order_id;
            const payment_id = payment.id;
            const email = payment.email;

            console.log(`Webhook received for Order ${order_id}`);

            // 1. Update Order in DB (Idempotency Check)
            // We need to find the order by razorpay_order_id OR we need to trust transactionId if we stored it?
            // Actually, in /api/orders/verify we create the order.
            // But what if the user closed the window? The order might not exist yet!
            // So we need to CREATE or UPDATE.

            // Problem: Our Order model links to `userId`. Webhook doesn't know userId unless we passed it in `notes`.
            // Solution for MVP: We assume verify API works 99% of time. 
            // Webhook is for marking STATUS as SUCCESS if it was PENDING.
            // OR: We find order by `transactionId` which we might not have yet?
            // Razorpay Order ID is not stored in our DB Order model... wait.
            // Schema: `transactionId String?`. This stores `payment_id`.

            // If the user closed the window, `verify` API was never called, so `Order` was never created.
            // This is a common issue. 
            // To fix this properly, we should have created an `Order` with status `PENDING` *before* sending them to Razorpay (in /create API).
            // Let's check /create API logic.
            // /create API: currently just returns Razorpay Order ID. It DOES NOT create a DB record.

            // CRITICAL ARCHITECTURE DECISION:
            // For robust webhooks, we MUST create the DB Order as PENDING in /api/orders/create.
            // Then Webhook can find it by `razorpay_order_id`.
            // But our schema doesn't have `razorpay_order_id` column.

            // FOR NOW (Scope limitation):
            // We will stick to the current flow where Webhook is a "Backup" verification. 
            // If the Order exists (created by frontend verify), we insure it's marked COMPLETED.
            // If it doesn't exist, we can't create it reliably because we lack `userId` and `productId` details easily (unless we parse `notes`).

            // Let's Check: Did we pass notes in /client.tsx? No.
            // So this Webhook is only useful if the Order record *already exists* (e.g. status stuck in 'PENDING').
            // Wait, our verify route creates it as 'COMPLETED' immediately.

            // Refinement:
            // We will write this webhook to simply Log success for now, as re-architecting the entire Order flow to be Pre-Created is a larger risk at this stage.
            // Ideally: We should search for an order with this `payment_id`.

            const existingOrder = await prisma.order.findFirst({
                where: { transactionId: payment_id }
            });

            if (existingOrder) {
                if (existingOrder.status !== 'COMPLETED') {
                    await prisma.order.update({
                        where: { id: existingOrder.id },
                        data: { status: 'COMPLETED' }
                    });
                    console.log(`Order ${existingOrder.id} marked as COMPLETED via Webhook`);
                } else {
                    console.log(`Order ${existingOrder.id} already COMPLETED`);
                }
            } else {
                console.warn(`Order not found for Payment ID ${payment_id}. This architecture relies on client-side verification.`);
            }
        }

        return NextResponse.json({ status: 'ok' });

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
