import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

import bcrypt from "bcryptjs"

async function getUser(email: string) {
    try {
        console.log(`[Auth] Fetching user: ${email}`);
        const user = await prisma.user.findUnique({ where: { email } });
        console.log(`[Auth] User found: ${!!user}`);
        return user;
    } catch (error) {
        console.error('[Auth] Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log('[Auth] Authorizing credentials...');
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) {
                        console.log('[Auth] User not found during authorization.');
                        return null;
                    }

                    // For simplicity in this demo, we might allow any password if not set, 
                    // or properly check bcrypt hash if password exists.
                    // In a real app: await bcrypt.compare(password, user.password);
                    if (user.password) {
                        console.log('[Auth] Comparing passwords...');
                        const passwordsMatch = await bcrypt.compare(password, user.password);
                        console.log(`[Auth] Password match result: ${passwordsMatch}`);
                        if (passwordsMatch) return user;
                    } else {
                        // Allow login if user exists but has no password (e.g. earlier oauth) - or fail
                        console.log('[Auth] User has no password set.');
                        return null;
                    }
                } else {
                    console.log('[Auth] Invalid credential format:', parsedCredentials.error);
                }

                console.log('[Auth] Authorization failed.');
                return null;
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async session({ session, token }: any) {
            if (token?.sub && session.user) {
                session.user.id = token.sub;
                session.user.role = token.role; // Add role to session
            }
            return session;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.sub = user.id;
                token.role = (user as any).role; // Add role to token
            }
            return token;
        }
    }
});
