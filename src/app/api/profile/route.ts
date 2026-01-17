import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const profileSchema = z.object({
    name: z.string().min(1, "Name is required"),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, "Password must be at least 6 characters").optional()
});

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const result = profileSchema.safeParse(body);

        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;
            // Get the first error message from any field
            const firstError = Object.values(fieldErrors).flat()[0] || 'Invalid input';
            return NextResponse.json({ error: firstError }, { status: 400 });
        }

        const { name, currentPassword, newPassword } = result.data;
        const userEmail = session.user.email;

        // Fetch current user data (need password for verification)
        const user = await prisma.user.findUnique({
            where: { email: userEmail }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updateData: any = { name };

        // If changing password
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: 'Current password is required to set a new one' }, { status: 400 });
            }

            // Verify current password
            // Note: Users who signed up via OAuth (if added later) might not have a password. 
            // For now assuming all are Credentials users per our implementation.
            if (user.password) {
                const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
                if (!passwordsMatch) {
                    return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
                }
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateData.password = hashedPassword;
        }

        await prisma.user.update({
            where: { email: userEmail },
            data: updateData
        });

        return NextResponse.json({ success: true, message: 'Profile updated' });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
