'use client';
import { useState } from 'react';

export default function PaymentModal({
    price,
    onClose,
    onSuccess
}: {
    price: number;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [isVerifying, setIsVerifying] = useState(false);

    const handlePayment = () => {
        setIsVerifying(true);
        // Simulate API call
        setTimeout(() => {
            setIsVerifying(false);
            onSuccess();
        }, 2000);
    };

    return (
        <div className="modal-overlay">
            <div className="glass-panel modal-content">
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                    ✕
                </button>

                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Complete Payment</h2>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '1rem' }}>
                        <div style={{ width: '200px', height: '200px', background: '#111', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '0.875rem' }}>
                            [QR Code Placeholder] <br /><br /> Pay ₹{price}
                        </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Or pay to VPA:</p>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace' }}>
                            digitalstore@upi
                        </div>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={isVerifying}
                        className="btn-primary btn-full"
                        style={{
                            background: 'hsl(var(--primary))',
                            color: 'black',
                            opacity: isVerifying ? 0.7 : 1,
                            cursor: isVerifying ? 'wait' : 'pointer',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        {isVerifying ? 'Verifying...' : 'I have made the payment'}
                    </button>
                </div>
            </div>
        </div>
    );
}
