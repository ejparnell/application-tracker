import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { dbConnect } from './database';
import { User } from '@/models/user';
import { loginSchema } from '@/utils/schemas/auth-schema';

/**
 * @fileoverview Configuration for NextAuth.js authentication using a
 * custom credentials provider backed by MongoDB.
 *
 * @author ejparnell
 * @since 1.0.0
 */

/**
 * NextAuth configuration that sets up credential-based authentication
 * with email and password. Users are validated against the MongoDB
 * `User` model and authenticated via bcrypt password comparison.
 */
export const authOptions: NextAuthOptions = {
    session: { strategy: 'jwt' },
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const { email, password } = loginSchema.parse(credentials);
                    await dbConnect();

                    const user = await User.findOne({ email }).select(
                        '+password'
                    );
                    if (!user) return null;

                    const match = await bcrypt.compare(
                        password,
                        user.password as string
                    );
                    if (!match) return null;

                    return {
                        id: user._id.toString(),
                        name: user.name || user.email.split('@')[0],
                        email: user.email,
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) token.id = user.id;
            return token;
        },
        async session({ session, token }) {
            if (token?.id)
                session.user = { ...session.user, id: token.id as string };
            return session;
        },
    },
    pages: { signIn: '/login' },
    secret: process.env.NEXTAUTH_SECRET,
};
