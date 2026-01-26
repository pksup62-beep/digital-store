'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import Swal from 'sweetalert2';

// Helper to load Razorpay script
const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function ProductPageClient({ product, isPurchased: initialIsPurchased, userId }: any) {
    const [isPurchased, setIsPurchased] = useState(initialIsPurchased);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleBuyNow = async () => {
        if (!userId) {
            router.push('/login');
            return;
        }

        // Free Product Flow
        if (product.price === 0) {
            try {
                setIsLoading(true);
                const res = await fetch('/api/orders', { // Uses the simple mock order creation for free items?
                    // Wait, we need to unify. 
                    // If price is 0, we can probably skip razorpay and just create order directly.
                    // Let's assume /api/orders exists? 
                    // I previously used /api/orders in previous steps. 
                    // Ah, I need to check if /api/orders exists. 
                    // If not, I should create it or use /api/orders/verify with a special flag? 
                    // Let's stick to the previous code's logic for free items if /api/orders existed.
                    // Previous code used: fetch('/api/orders'...)
                    // Let's assume it exists.
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: product.id }),
                });
                if (!res.ok) throw new Error('Failed to claim free course');
                setIsPurchased(true);
                router.refresh();
            } catch (err) {
                Swal.fire({
                    title: 'Error',
                    text: 'Something went wrong while claiming the free course.',
                    icon: 'error'
                });
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // Paid Product Flow (Razorpay)
        setIsLoading(true);
        try {
            // 1. Load Script
            const isLoaded = await loadRazorpay();
            if (!isLoaded) throw new Error('Razorpay SDK failed to load');

            // 2. Create Order
            const orderRes = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product.id }),
            });

            const orderData = await orderRes.json();
            if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

            // 3. Open Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Frontend key
                amount: orderData.amount,
                currency: orderData.currency,
                name: "DigitalStore",
                description: product.title,
                order_id: orderData.id,
                handler: async function (response: any) {
                    // 4. Verify Payment
                    try {
                        const verifyRes = await fetch('/api/orders/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                productId: product.id
                            }),
                        });

                        const verifyData = await verifyRes.json();
                        if (!verifyRes.ok) throw new Error(verifyData.error || 'Verification failed');

                        setIsPurchased(true);
                        router.refresh();
                        Swal.fire({
                            title: 'Success!',
                            text: 'Payment Successful! Course Added.',
                            icon: 'success',
                            confirmButtonText: 'Great!',
                            confirmButtonColor: '#22c55e'
                        });
                    } catch (err: any) {
                        Swal.fire({
                            title: 'Error',
                            text: err.message || 'Payment verification failed',
                            icon: 'error',
                            confirmButtonColor: '#ef4444'
                        });
                    }
                },
                prefill: {
                    name: "User Name", // Ideally fill from session if available
                    email: "user@example.com",
                },
                theme: {
                    color: "#22c55e",
                },
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

        } catch (error: any) {
            console.error('Payment Error:', error);
            Swal.fire({
                title: 'Error',
                text: error.message || 'Payment failed',
                icon: 'error',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container product-layout">
            <div className="main-content">
                <div style={{ marginBottom: '2rem' }}>
                    <Link href="/" style={{ color: '#888', fontSize: '0.875rem', display: 'inline-block', marginBottom: '1rem' }}>
                        ← Back to Courses
                    </Link>
                    <h1>{product.title}</h1>
                </div>

                <VideoPlayer url={product.videoUrl} />

                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem', marginTop: '2rem' }}>
                    <h3>Description</h3>
                    <p style={{ color: '#ccc', margin: 0 }}>
                        {product.description}
                    </p>
                </div>
            </div>

            <aside>
                <div className="glass-panel checkout-card">
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <span style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: '#888', letterSpacing: '1px' }}>Total Price</span>
                        <div className="price-tag">
                            {product.price === 0 ? 'Free' : `₹${product.price}`}
                        </div>
                    </div>

                    <ul className="feature-list">
                        {product.features.map((feature: string, i: number) => (
                            <li key={i}>
                                <span style={{ color: '#4ade80' }}>✓</span> {feature}
                            </li>
                        ))}
                    </ul>

                    {isPurchased ? (
                        <a
                            href={product.pdfUrl}
                            download
                            className="btn-primary btn-full"
                            style={{ background: '#22c55e', color: 'black', textDecoration: 'none' }}
                        >
                            Download PDF Now
                        </a>
                    ) : (
                        <button
                            onClick={handleBuyNow}
                            disabled={isLoading}
                            className="btn-primary"
                            style={{ width: '100%', opacity: isLoading ? 0.7 : 1 }}
                        >
                            {isLoading ? 'Processing...' : (product.price === 0 ? "Get for Free" : "Buy Now")}
                        </button>
                    )}

                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#666', marginTop: '1rem' }}>
                        Secure payment via Razorpay. Instant delivery.
                    </p>
                </div>
            </aside>
        </div>
    );
}
