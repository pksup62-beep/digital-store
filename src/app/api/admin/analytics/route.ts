import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await auth();

        // Strict Admin Check
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Total Revenue & Orders
        const totalSalesData = await prisma.order.aggregate({
            _sum: {
                amount: true,
            },
            _count: {
                id: true,
            },
            where: {
                status: 'COMPLETED'
            }
        });

        // 2. Unique Customers
        const uniqueCustomers = await prisma.order.groupBy({
            by: ['userId'],
            where: {
                status: 'COMPLETED'
            }
        });

        // 3. Recent Sales
        const recentSales = await prisma.order.findMany({
            where: {
                status: 'COMPLETED'
            },
            take: 5,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: { name: true, email: true }
                },
                product: {
                    select: { title: true }
                }
            }
        });

        // 4. Revenue by Product (for Charts)
        const productPerformance = await prisma.order.groupBy({
            by: ['productId'],
            _sum: {
                amount: true
            },
            _count: {
                id: true
            },
            where: {
                status: 'COMPLETED'
            }
        });

        // Enrich product performance with actual product names
        // (Prisma groupBy doesn't support relation inclusion directly)
        const enrichedProductPerformance = await Promise.all(
            productPerformance.map(async (item) => {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                    select: { title: true }
                });
                return {
                    name: product?.title || 'Unknown Product',
                    revenue: item._sum.amount || 0,
                    sales: item._count.id
                };
            })
        );

        return NextResponse.json({
            totalRevenue: totalSalesData._sum.amount || 0,
            totalOrders: totalSalesData._count.id || 0,
            totalCustomers: uniqueCustomers.length,
            recentSales,
            chartData: enrichedProductPerformance
        });

    } catch (error) {
        console.error('Analytics API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
