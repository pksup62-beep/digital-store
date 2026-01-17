'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const router = useRouter();

    const [name, setName] = useState(session?.user?.name || '');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Sync name when session loads
    if (session?.user?.name && name === '') {
        setName(session.user.name);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: '', type: '' });

        if (newPassword && newPassword !== confirmPassword) {
            setMessage({ text: 'New passwords do not match', type: 'error' });
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    currentPassword: password,
                    newPassword: newPassword || undefined
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to update profile');

            setMessage({ text: 'Profile updated successfully!', type: 'success' });

            // Update session data based on new name
            await update({ name });

            // Clear password fields
            setPassword('');
            setNewPassword('');
            setConfirmPassword('');

            router.refresh();
        } catch (err: any) {
            setMessage({ text: err.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }

    if (!session) {
        return <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <main className="container" style={{ paddingTop: '8rem', paddingBottom: '5rem', maxWidth: '600px' }}>
            <h1>My Profile</h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Manage your account settings</p>

            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {message.text && (
                        <div style={{
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                            color: message.type === 'error' ? '#ef4444' : '#22c55e',
                            border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`
                        }}>
                            {message.text}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email</label>
                        <input className="input-field" value={session.user?.email || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                        <small style={{ color: '#666' }}>Email cannot be changed</small>
                    </div>

                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            className="input-field"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                        />
                    </div>

                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1rem 0' }} />
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Change Password</h3>

                    <div className="form-group">
                        <label>Current Password</label>
                        <input
                            className="input-field"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="form-group">
                        <label>New Password (Optional)</label>
                        <input
                            className="input-field"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Leave blank to keep current"
                        />
                    </div>

                    {newPassword && (
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                className="input-field"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    <button type="submit" disabled={isLoading} className="btn-primary">
                        {isLoading ? 'Updating...' : 'Save Changes'}
                    </button>

                    <button type="button" onClick={() => router.push('/my-courses')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', alignSelf: 'center' }}>
                        Back to My Courses
                    </button>
                </form>
            </div>

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
        </main>
    );
}
