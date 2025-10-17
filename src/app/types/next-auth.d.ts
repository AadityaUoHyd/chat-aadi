import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    createdAt?: Date | string;
  }

  interface Session {
    user: {
      id: string;
      createdAt?: Date | string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    createdAt?: Date | string;
  }
}