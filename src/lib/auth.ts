import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google"
import prisma from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";

export const authOptions:NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, user }:any) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }:any) {
            if (token) {
                session.user.id = token.id as string;
            }

            return session;
        },
    },

    secret: process.env.NEXTAUTH_SECRET

}

