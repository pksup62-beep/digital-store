
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import { prisma } from '@/lib/prisma';
import SearchFilter from '@/components/SearchFilter';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams; // Next.js 15+ needs await
  const category = resolvedParams?.category as string;
  const search = resolvedParams?.search as string;

  const where: any = {};

  if (category && category !== 'All') {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { title: { contains: search } }, // SQLite is case-insensitive by default in many cases, but normally mode: 'insensitive' needed for Postgres
      { description: { contains: search } }
    ];
  }

  // Fetch products from database
  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main>
      <Hero />

      <section id="courses" className="section-padding">
        <div className="container">
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Featured Courses</h2>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1, marginLeft: '2rem' }} />
            </div>

            {/* Search & Filter Component */}
            <SearchFilter />
          </div>

          <div className="products-grid">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: '#666' }}>
                <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No courses found</p>
                <p>Try adjusting your search or filter.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '2.5rem 0', textAlign: 'center', color: '#666', fontSize: '0.875rem' }}>
        <p>© 2026 DigitalStore. All rights reserved.</p>
      </footer>
    </main>
  );
}
