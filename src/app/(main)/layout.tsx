// app/(main)/layout.tsx
"use client";

import { Suspense } from 'react';
import HeaderWrapper from "@/components/header/HeaderWrapper";
import Sidepanel from "@/components/sidepanel/Sidepanel";
import { usePathname } from "next/navigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatPage = pathname.startsWith("/c/");
  const currentChatId = isChatPage ? pathname.split("/")[2] : undefined;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidepanel currentChatId={currentChatId} />
      <div className="flex-1 flex flex-col min-h-0">
        <HeaderWrapper />
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}