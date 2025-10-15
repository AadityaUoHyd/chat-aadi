"use client";

import Header from "@/components/header/Header";
import Sidepanel from "@/components/sidepanel/Sidepanel";
import { SidebarProvider } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatPage = pathname.startsWith("/c/");
  const currentChatId = isChatPage ? pathname.split("/")[2] : undefined;

  return (
    <SidebarProvider className="min-h-screen flex">
      <div>
        <Sidepanel currentChatId={currentChatId} />
      </div>
      <div className="flex-1 flex flex-col h-[100vh]">
        <div>
          <Header />
        </div>
          {children}
      </div>
    </SidebarProvider>
  );
}
