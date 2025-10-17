import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { NextAuthOptions, User } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import bcrypt from "bcryptjs";


const prismaAdapter = PrismaAdapter(prisma);
prismaAdapter.getUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    }
  });
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
        async jwt({ token, user, isNewUser }) {
    if (user) {
        token.id = user.id;
        try {
            const dbUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: { id: true, name: true, email: true, image: true, createdAt: true }
            });
            if (dbUser?.createdAt) {
                token.createdAt = dbUser.createdAt;
            } else if (isNewUser) {
                token.createdAt = new Date();
            }
        } catch (error) {
            console.error('Error in JWT callback:', error);
        }
    }
    return token;
},
        async session({ session, token }) {
    if (token?.id) {
        session.user.id = token.id as string;
        if (token.createdAt) {
            session.user.createdAt = token.createdAt;
        } else {
            try {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { createdAt: true }
                });
                if (dbUser?.createdAt) {
                    session.user.createdAt = dbUser.createdAt;
                }
            } catch (error) {
                console.error('Error fetching user in session callback:', error);
            }
        }
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