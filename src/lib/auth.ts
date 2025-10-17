import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { NextAuthOptions, User } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import bcrypt from "bcryptjs";


// Initialize the Prisma adapter
const prismaAdapter = PrismaAdapter(prisma);
// Extend the adapter to include custom user lookup by email
prismaAdapter.getUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: true,
      sessions: true
    }
  });
  
  if (!user) return null;
  
  // Convert to AdapterUser type with proper date formatting
  return {
    id: user.id,
    name: user.name,
    email: user.email || '', // Ensure email is not null
    emailVerified: user.emailVerified,
    image: user.image,
    createdAt: user.createdAt.toISOString(), // Convert Date to ISO string
    updatedAt: user.updatedAt?.toISOString() || null, // Convert Date to ISO string or null
  } as AdapterUser;
};

export const authOptions: NextAuthOptions = {
    adapter: prismaAdapter,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,

            profile(profile) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
      // Add any other fields you want to include
    }
  }
        }),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please enter email and password');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.password) {
                    throw new Error('No user found with this email');
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                
                if (!isValid) {
                    throw new Error('Invalid password');
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                };
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            // Handle Google OAuth sign-in
            if (account?.provider === 'google') {
                try {
                    // Check if user already exists with this email
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email! }
                    });

                    // If user exists but doesn't have a Google account linked
                    if (existingUser) {
                        const existingAccount = await prisma.account.findFirst({
                            where: {
                                userId: existingUser.id,
                                provider: 'google'
                            }
                        });

                        if (!existingAccount) {
                            // Link the Google account to the existing user
                            await prisma.account.create({
                                data: {
                                    userId: existingUser.id,
                                    type: 'oauth',
                                    provider: 'google',
                                    providerAccountId: account.providerAccountId,
                                    access_token: account.access_token,
                                    refresh_token: account.refresh_token,
                                    expires_at: account.expires_at,
                                    token_type: account.token_type,
                                    scope: account.scope,
                                    id_token: account.id_token,
                                }
                            });
                        }
                        
                        // Update user with Google account info if needed
                        if (!existingUser.image || !existingUser.name) {
                            await prisma.user.update({
                                where: { id: existingUser.id },
                                data: {
                                    name: user.name || existingUser.name,
                                    image: user.image || existingUser.image,
                                    emailVerified: new Date()
                                }
                            });
                        }
                        
                        // Update the user object to match the existing user
                        user.id = existingUser.id;
                        return true;
                    }
                } catch (error) {
                    console.error('Error in Google OAuth sign-in:', error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account, profile, isNewUser }) {
            // Initial sign in
            if (user) {
                try {
                    // Get the full user data including createdAt
                    const dbUser = await prisma.user.findUnique({
                        where: { id: user.id },
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            image: true,
                            createdAt: true
                        }
                    });

                    if (dbUser) {
                        return {
                            ...token,
                            id: dbUser.id,
                            email: dbUser.email,
                            name: dbUser.name,
                            picture: dbUser.image,
                            createdAt: dbUser.createdAt ? new Date(dbUser.createdAt).toISOString() : new Date().toISOString()
                        };
                    }
                } catch (error) {
                    console.error('Error in JWT callback:', error);
                }
            }
            
            return token;
        },
        async session({ session, token }) {
            if (token) {
                // Get the user from the database to ensure we have the latest data
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        image: true,
                        createdAt: true
                    }
                });

                session.user = {
                    ...session.user,
                    id: token.id as string,
                    name: token.name as string,
                    email: token.email as string,
                    image: token.picture as string,
                    createdAt: dbUser?.createdAt ? new Date(dbUser.createdAt).toISOString() : new Date().toISOString()
                };
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
};