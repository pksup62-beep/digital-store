export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    pdfUrl: string;
    videoUrl: string;
    thumbnail: string;
    features: string[];
}

export const products: Product[] = [
    {
        id: '1',
        title: 'Advanced React Patterns',
        description: 'Master advanced React concepts including Compound Components, Control Props, and Custom Hooks.',
        price: 4999, // in cents/paise or smallest currency unit, simplified to number for display logic
        pdfUrl: '/assets/react-patterns.pdf',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop', // React-themed image
        features: ['200+ Pages PDF', 'Source Code Included', 'Lifetime Updates']
    },
    {
        id: '2',
        title: 'System Design Interview Guide',
        description: 'A comprehensive guide to cracking system design interviews at top tech companies.',
        price: 7999,
        pdfUrl: '/assets/system-design.pdf',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop', // Tech/Architecture image
        features: ['Real-world examples', 'Diagrams & Schemas', 'Interview Checklists']
    },
    {
        id: '3',
        title: 'Full Stack Next.js Mastery',
        description: 'Build production-ready applications with Next.js 14, Prisma, and Tailwind (concepts applicable to Vanilla too!).',
        price: 5999,
        pdfUrl: '/assets/nextjs-mastery.pdf',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=800&auto=format&fit=crop', // Code image
        features: ['Project-based learning', 'Deployment Guide', 'Best Practices']
    }
];
