'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';

export default function SearchFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initial state from URL
    const initialCategory = searchParams.get('category') || 'All';
    const initialSearch = searchParams.get('search') || '';

    const [category, setCategory] = useState(initialCategory);
    const [search, setSearch] = useState(initialSearch);

    // Debounce search update
    const [debouncedSearch] = useDebounce(search, 500);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value && value !== 'All') {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    // Update URL when category changes
    const handleCategoryChange = (newCategory: string) => {
        setCategory(newCategory);
        const params = new URLSearchParams(searchParams.toString());
        if (newCategory === 'All') {
            params.delete('category');
        } else {
            params.set('category', newCategory);
        }
        router.push('/?' + params.toString());
    };

    // Update URL when search changes (debounced)
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        const currentSearch = params.get('search') || '';

        // Prevent infinite loop: only update if value actually changed
        if (currentSearch === debouncedSearch) return;

        if (debouncedSearch) {
            params.set('search', debouncedSearch);
        } else {
            params.delete('search');
        }
        router.push('/?' + params.toString());
    }, [debouncedSearch, router, searchParams]);

    const categories = ['All', 'Development', 'Business', 'Design', 'Marketing', 'Lifestyle'];

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Search Input */}
            <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none'
                }}
            />

            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '2rem',
                            border: '1px solid',
                            borderColor: category === cat ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                            background: category === cat ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                            color: category === cat ? 'var(--primary)' : '#888',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
}

// Simple internal debounce hook since we might not have 'use-debounce' installed
function useDebounce<T>(value: T, delay: number): [T] {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return [debouncedValue];
}
