import Link from 'next/link';
import { auth, signOut } from '@/auth'; // Server-side auth

export default async function Header() {
    const session = await auth();

    return (
        <header className="site-header">
            <div className="container header-inner">
                <Link href="/" className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    DigitalStore
                </Link>

                <nav className="nav-links">
                    <Link href="/" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                        Courses
                    </Link>

                    {session?.user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Link href="/my-courses" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                                My Courses
                            </Link>
                            {session.user.role === 'ADMIN' && (
                                <Link href="/admin" className="btn-glass" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', background: 'rgba(255, 215, 0, 0.1)', borderColor: 'rgba(255, 215, 0, 0.3)', color: '#ffd700' }}>
                                    Dashboard
                                </Link>
                            )}
                            <Link
                                href="/profile"
                                style={{ fontSize: '0.9rem', fontWeight: 500 }}
                            >
                                Profile
                            </Link>
                            <span style={{ fontSize: '0.9rem' }}>Hi, {session.user.name || session.user.email}</span>
                            <form action={async () => {
                                'use server';
                                await signOut();
                            }}>
                                <button className="btn-glass" type="submit" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
                                    Sign Out
                                </button>
                            </form>
                        </div>
                    ) : (
                        <Link href="/login" className="btn-glass">
                            Sign In
                        </Link>
                    )}


                </nav>
            </div>
        </header>
    );
}
