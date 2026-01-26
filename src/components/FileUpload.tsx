'use client';

import { useState } from 'react';
import { UploadButton } from '@/utils/uploadthing';
import Swal from 'sweetalert2';
import "@uploadthing/react/styles.css";

interface FileUploadProps {
    label: string;
    accept?: string;
    onUploadComplete: (url: string) => void;
    currentValue?: string;
}

export default function FileUpload({ label, accept, onUploadComplete, currentValue }: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState(currentValue);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            setPreview(data.url);
            onUploadComplete(data.url); // Pass URL back to parent form
        } catch (error) {
            console.error('Upload error:', error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to upload file',
                icon: 'error'
            });
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div className="form-group">
            <label>{label}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <UploadButton
                    endpoint={accept?.includes('image') ? "imageUploader" : "pdfUploader"}
                    onClientUploadComplete={(res) => {
                        // Do something with the response
                        if (res && res[0]) {
                            const url = res[0].url;
                            setPreview(url);
                            onUploadComplete(url);
                            Swal.fire({
                                title: 'Success',
                                text: 'Upload Completed',
                                icon: 'success',
                                timer: 2000,
                                showConfirmButton: false
                            });
                        }
                    }}
                    onUploadError={(error: Error) => {
                        // Do something with the error.
                        Swal.fire({
                            title: 'Error',
                            text: error.message,
                            icon: 'error'
                        });
                    }}
                />
            </div>

            {preview && (
                <div style={{ marginTop: '0.5rem' }}>
                    <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>Current URL:</p>
                    <input
                        type="text"
                        readOnly
                        value={preview}
                        className="input-field"
                        style={{ width: '100%', fontSize: '0.8rem', opacity: 0.7 }}
                    />
                    {/* Basic Image Preview if it looks like an image */}
                    {(preview.endsWith('.jpg') || preview.endsWith('.png') || preview.endsWith('.webp') || preview.endsWith('.jpeg') || preview.includes('utfs.io/f/')) && (
                        <img src={preview} alt="Preview" style={{ marginTop: '0.5rem', height: '60px', borderRadius: '4px' }} />
                    )}
                </div>
            )}
        </div>
    );
}
