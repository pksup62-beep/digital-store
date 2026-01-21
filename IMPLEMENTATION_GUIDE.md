# Digital Store Project: Master Implementation Guide & Interview Prep

## 1. Project Overview & Architecture
**Objective**: Build a full-stack digital marketplace for selling video courses and PDF assets.
**Key Constraint**: Zero-cost "Free Tier" architecture for production.

### Technology Stack
- **Frontend**: Next.js 16 (App Router), React 19, Vanilla CSS (Glassmorphism design).
- **Backend**: Next.js Server Actions & API Routes.
- **Database**: PostgreSQL (Neon.tech) - *Migrated from SQLite*.
- **ORM**: Prisma (v5.10.2).
- **Auth**: NextAuth.js (v5 Beta).
- **Storage**: Uploadthing (S3 wrapper).
- **Payments**: Razorpay.
- **Hosting**: Vercel (Serverless).

---

## 2. Phase 1: Core Application Structure
### Design Philosophy
- **Glassmorphism**: Used semi-transparent backgrounds (`backdrop-filter: blur`), subtle borders, and gradients to create a premium feel without heavy libraries.
- **Responsive Grid**: CSS Grid and Flexbox used manually to ensure mobile compatibility.

### Key Components
- **`ProductCard`**: Reusable component for displaying course thumbnails and prices.
- **`VideoPlayer`**: Custom wrapper to embed YouTube/Vimeo links securely.
- **`FileUpload`**: Abstrated component to handle file selection and upload progress.

---

## 3. Phase 2: Database & ORM (Prisma)
### Schema Design (`schema.prisma`)
We defined three core models:
1.  **User**: Handles authentication and roles (`ADMIN` vs `USER`).
2.  **Product**: Stores course details, pricing, and asset URLs.
3.  **Order**: Tracks purchases and links Users to Products.

### The Migration Journey (SQLite -> Postgres)
**Initial State**: Used `sqlite` locally for rapid development.
**Problem**: SQLite cannot run on Vercel's serverless environment (ephemeral file system).
**Solution**: Migrated to Neon (Serverless Postgres).

**Steps Taken:**
1.  Created Neon Project and got `DATABASE_URL`.
2.  Updated `schema.prisma`:
    ```prisma
    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }
    ```
3.  **Downgrade Strategy**: We encountered initialization errors with Prisma v7 on Vercel. We deliberately downgraded to **Prisma v5.10.2** for maximum stability with the Vercel build pipeline.
4.  **Seeding**: Created `prisma/seed.js` to populate initial admin user and products.

---

## 4. Phase 3: Authentication & Security
### NextAuth.js Integration
- **Credentials Provider**: Custom logic to verify email/password against the Prisma database using `bcryptjs`.
- **Session Management**: Used `SessionProvider` in `app/layout.tsx` to expose user state globally (e.g., for the Navbar).
- **Role-Based Access Control (RBAC)**:
    - Middleware checks `session.user.role`.
    - Content (PDF/Video) is hidden on the frontend unless the user has purchased the course (checked via API).

---

## 5. Phase 4: File Storage (Uploadthing)
**Problem**: We cannot save uploaded files to the local `public/` folder on Vercel because the server "resets" after every execution.
**Solution**: Integrated **Uploadthing**.

**Implementation Details:**
- **Router (`core.ts`)**: Defined secure endpoints (`imageUploader`, `pdfUploader`) with file size limits (4MB / 64MB).
- **Security**: Added `middleware` to the upload route that rejects anyone who isn't an ADMIN.
- **Frontend**: Replaced the standard `<input type="file">` with Uploadthing's `<UploadButton />`.

---

## 6. Phase 5: Payments (Razorpay)
### Workflow
1.  **Frontend**: User clicks "Buy". Calls `/api/orders/create`.
2.  **Backend**: Creates a Razorpay Order ID and sends it back.
3.  **Frontend**: Opens Razorpay Modal with that Order ID.
4.  **Verification**: After payment, Razorpay returns a `signature`.
    - We MUST verify this signature on the backend (HMAC SHA256) to prevent fraud.
    - Only after verification do we create the `Order` record in the database.

---

## 7. Phase 6: Deployment & CI/CD (The Interview Gold)
This was the most complex part. Here is how we solved production issues:

### 1. The Build Process
Vercel runs `npm run build`. This compiles the Next.js app.
*Critical Step*: Next.js needs the Database Client *during* the build to generate static pages.
*Fix*: We added `"postinstall": "prisma generate"` to `package.json`. This forces Vercel to generate the Prisma Client immediately after installing dependencies.

### 2. Environment Variables
Local `.env` files are not committed to Git. We manually added these to Vercel Project Settings:
- `DATABASE_URL` (Connection string)
- `AUTH_SECRET` (Encryption key)
- `RAZORPAY_...` (Payment keys)
- `UPLOADTHING_...` (Storage keys)

### 3. Troubleshooting
- **Build Errors**: We faced TypeErrors with Zod. Fixed by strictly typing `result.error.flatten()`.
- **Prisma Adapters**: Removed experimental `driverAdapters` to stick to the stable "Library" engine type.

---

## Interview Cheat Sheet: "Tell me about a challenge you faced."
*"When deploying to Vercel, I faced a Prisma Initialization Error. The build was failing because the static generation process couldn't connect to the DB. I diagnosed that the Prisma Client wasn't being generated in the CI environment. I fixed this by adding a `postinstall` hook to run `prisma generate`, ensuring the client API was ready before the Next.js build step triggered."*
