'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FileUpload from './FileUpload';

interface ProductFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // State to hold URLs from FileUpload
    const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnail || '');
    const [pdfUrl, setPdfUrl] = useState(initialData?.pdfUrl || '');

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(event.currentTarget);

        const featuresText = formData.get('features') as string;
        const featuresArray = featuresText.split('\n').filter(line => line.trim() !== '');

        // Auto-convert YouTube watch URLs to embed URLs
        let videoUrl = formData.get('videoUrl') as string;
        if (videoUrl.includes('youtube.com/watch?v=')) {
            const videoId = videoUrl.split('v=')[1]?.split('&')[0];
            if (videoId) videoUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (videoUrl.includes('youtu.be/')) {
            const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
            if (videoId) videoUrl = `https://www.youtube.com/embed/${videoId}`;
        }

        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            price: formData.get('price'),
            category: formData.get('category'),
            thumbnail: thumbnailUrl, // Use state
            pdfUrl: pdfUrl,          // Use state
            videoUrl: videoUrl,
            features: JSON.stringify(featuresArray)
        };

        try {
            const url = isEdit ? `/api/products/${initialData.id}` : '/api/products';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || 'Failed to save product');
            }

            router.push('/admin');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    // Helper to format features JSON back to string
    const defaultFeatures = initialData?.features
        ? (typeof initialData.features === 'string'
            ? JSON.parse(initialData.features).join('\n')
            : initialData.features.join('\n'))
        : '';

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {error && (
                <div style={{ color: '#ff6b6b', background: 'rgba(255,0,0,0.1)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,0,0,0.1)' }}>
                    {error}
                </div>
            )}

            <div className="form-group">
                <label>Title</label>
                <input name="title" required defaultValue={initialData?.title} placeholder="e.g. Master React" className="input-field" />
            </div>

            <div className="form-group">
                <label>Description</label>
                <textarea name="description" required defaultValue={initialData?.description} rows={3} className="input-field" placeholder="Course details..." />
            </div>

            <div className="form-group">
                <label>Price (₹)</label>
                <input name="price" type="number" required defaultValue={initialData?.price} min="0" className="input-field" />
            </div>

            <div className="form-group">
                <label>Category</label>
                <select name="category" required defaultValue={initialData?.category || 'Development'} className="input-field" style={{ appearance: 'auto' }}>
                    <option value="Development">Development</option>
                    <option value="Business">Business</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Lifestyle">Lifestyle</option>
                </select>
            </div>

            {/* Hidden inputs to store the actual URLs submitted by FileUpload */}
            <input type="hidden" name="thumbnail" value={thumbnailUrl} />
            <input type="hidden" name="pdfUrl" value={pdfUrl} />

            <FileUpload
                label="Thumbnail Image"
                accept="image/*"
                currentValue={thumbnailUrl}
                onUploadComplete={(url) => setThumbnailUrl(url)}
            />

            <FileUpload
                label="Course PDF"
                accept=".pdf"
                currentValue={pdfUrl}
                onUploadComplete={(url) => setPdfUrl(url)}
            />

            <div className="form-group">
                <label>Video URL (YouTube Embed)</label>
                <input name="videoUrl" required defaultValue={initialData?.videoUrl} type="url" placeholder="https://www.youtube.com/embed/..." className="input-field" />
            </div>

            <div className="form-group">
                <label>Features (One per line)</label>
                <textarea name="features" required defaultValue={defaultFeatures} rows={5} className="input-field" placeholder="10 Hours Video&#10;Source Code&#10;Certificate" />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? 'Saving...' : (isEdit ? 'Update Course' : 'Create Course')}
            </button>

            <button type="button" onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginTop: '1rem' }}>
                Cancel
            </button>

            <style jsx>{`
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .form-group label {
                    font-size: 0.875rem;
                    color: #aaa;
                }
                .input-field {
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    color: white;
                    font-family: inherit;
                }
                .input-field:focus {
                    outline: none;
                    border-color: var(--primary);
                }
            `}</style>
        </form>
    );
}
