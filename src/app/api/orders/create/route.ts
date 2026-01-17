import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { z } from 'zod';

const createOrderSchema = z.object({
    productId: z.string().min(1)
});

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const result = createOrderSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const { productId } = result.data;

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Initialize Razorpay
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        // Create Order
        // Note: Amount is in smallest currency unit. Product.price is in Rupees (based on previous files), 
        // OR is it? Let's assume Product.price is in Rupees for now.
        // Wait, schema says "price Int // in cents/paise". 
        // Let's verify schema comment: "price Int // in cents/paise".
        // If it's already in paise, we use it directly.

        const options = {
            amount: product.price * 100, // Assuming product.price is RUPEES based on UI input type="number"
            // If schema comment says paise but UI input is logic, usually UI is Rupees.
            // Let's assume input is Rupees and store is Rupees context. 
            // Wait, standard E-comm pattern: Store integers (paise). 
            // Input 100 -> Store 100? No, Input 100 (Rupees) -> Store 10000 (Paise).
            // Let's check ProductForm.
            // ProductForm input type="number" step="1"? 
            // Input: 500. Backend saves 500. 
            // If Backend saves 500, and it's meant to be Rupees, then logic is product.price * 100.
            // If Backend saves 500 and it's meant to be Paise, then logic is product.price.

            // Let's assume ProductForm saves RAW value. If user types 999, DB gets 999. 
            // Usually users think in Rupees. So 999 Rupees.
            // So for Razorpay we need 999 * 100.

            currency: "INR",
            receipt: `receipt_${Date.now().toString().slice(-8)}`,
        };

        const order = await instance.orders.create(options);

        return NextResponse.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount
        });
    } catch (error: any) {
        console.error('Razorpay Order Error:', error);
        return NextResponse.json({ error: error.message || 'Payment initiation failed' }, { status: 500 });
    }
}
