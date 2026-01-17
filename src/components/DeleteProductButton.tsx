'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteProductButton({ id }: { id: string }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete');

            router.refresh();
        } catch (error) {
            alert('Failed to delete product');
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
                padding: '0.25rem 0.75rem',
                background: 'rgba(255,0,0,0.2)',
                border: '1px solid rgba(255,0,0,0.3)',
                borderRadius: '0.25rem',
                color: '#ff6b6b',
                fontSize: '0.875rem',
                cursor: isDeleting ? 'wait' : 'pointer',
                opacity: isDeleting ? 0.5 : 1
            }}
        >
            {isDeleting ? '...' : 'Delete'}
        </button>
    );
}
