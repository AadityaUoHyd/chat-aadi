"use client";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemeProvider } from "next-themes";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <NextThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
                {children}
            </NextThemeProvider>
        </SessionProvider>
    )
}