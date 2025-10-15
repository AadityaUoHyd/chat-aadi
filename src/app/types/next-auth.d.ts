import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // <-- your custom field
    } & DefaultSession["user"];
  }
}
