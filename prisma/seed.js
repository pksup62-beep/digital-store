require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const path = require('path')

// Initialize Prisma Client (Standard for Postgres)
const prisma = new PrismaClient()

const products = [
    {
        title: 'Advanced React Patterns',
        description: 'Master advanced React concepts including Compound Components, Control Props, and Custom Hooks.',
        price: 4999,
        pdfUrl: '/assets/react-patterns.pdf',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
        features: JSON.stringify(['200+ Pages PDF', 'Source Code Included', 'Lifetime Updates'])
    },
    {
        title: 'System Design Interview Guide',
        description: 'A comprehensive guide to cracking system design interviews at top tech companies.',
        price: 7999,
        pdfUrl: '/assets/system-design.pdf',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop',
        features: JSON.stringify(['Real-world examples', 'Diagrams & Schemas', 'Interview Checklists'])
    },
    {
        title: 'Full Stack Next.js Mastery',
        description: 'Build production-ready applications with Next.js 14, Prisma, and Tailwind.',
        price: 5999,
        pdfUrl: '/assets/nextjs-mastery.pdf',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=800&auto=format&fit=crop',
        features: JSON.stringify(['Project-based learning', 'Deployment Guide', 'Best Practices'])
    }
]

async function main() {
    console.log('Start seeding ...')

    // Seed Products
    for (const product of products) {
        // Upsert to avoid duplicates if running seed multiple times
        // We'll trust create is fine if DB is empty, or better use upsert if they had unique keys (title isn't unique constraint, but good enough for now)
        // createMany is dependent on DB. Loop create is fine.
        await prisma.product.create({
            data: product,
        })
    }
    console.log('Products seeded.')

    // Seed Test User
    // Password: password123
    const hashedPassword = await bcrypt.hash('password123', 10)

    const user = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: hashedPassword,
            role: 'ADMIN'
        }
    })
    console.log(`Created test user: ${user.email} (password: password123)`)

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        // Ensure we close connection on error too if possible, though process.exit kills it
        await prisma.$disconnect()
        process.exit(1)
    })
