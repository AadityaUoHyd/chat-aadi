"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Trash2, SidebarCloseIcon, SidebarOpenIcon, User2, ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import NewChat from "../icons/NewChat";
import Search from "../icons/Search";
import Library from "../icons/Library";
import ImageGenerator from "../icons/ImageGenerator";
import NewProject from "../icons/NewProject";
import clsx from "clsx";
import { useChats } from "@/hooks/chat";

interface SidepanelProps {
  currentChatId?: string;
}

export default function Sidepanel({ currentChatId }: SidepanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { chats, error, isLoading, deleteChat } = useChats();
  const { data: session } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 ${collapsed ? 'w-16' : 'w-64'}`} />
    );
  }

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this chat? This action cannot be undone.')) return;

    setDeletingId(chatId);
    try {
      await deleteChat(chatId);
      if (window.location.pathname.includes(chatId)) {
        router.push('/');
      }
    } catch (error: Error | unknown) {
      console.error('Error deleting chat:', error);
      alert((error as Error).message || 'Failed to delete chat. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={clsx(
      "bg-gray-50 transition-all duration-150 flex flex-col h-screen overflow-hidden border-r border-gray-200",
      collapsed ? 'w-[50px]' : 'w-[260px]'
    )}>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50">
        <div className="flex justify-between p-4 group">
          <button className={clsx("cursor-pointer flex items-center justify-center", {
            'group-hover:hidden': collapsed
          })}>
            <div className="flex items-center gap-2">
              <img
                src="/chatAadi.png"
                alt="ChatAadi Logo"
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-semibold text-gray-800">ChatAadi</span>
            </div>
          </button>
          <button className={clsx("cursor-pointer", {
            "hidden group-hover:block": collapsed
          })} onClick={() => setCollapsed(!collapsed)}>
            {collapsed
              ? <SidebarOpenIcon width={16} height={16} className="text-gray-600 h-6 w-6" />
              : <SidebarCloseIcon width={16} height={16} className="text-gray-600 h-6 w-6" />}
          </button>
        </div>
        <div className="px-2">
          <Link href="/" className="px-2 rounded-sm flex gap-3 py-2 text-md w-full hover:bg-gray-200">
            <NewChat className="text-black w-6 h-6 flex-shrink-0" />
            <span className={clsx({ "hidden": collapsed })}>New chat</span>
          </Link>
          <Link href="/" className="px-2 rounded-sm flex gap-3 py-2 text-md w-full hover:bg-gray-200">
            <Search className="text-black w-6 h-6 flex-shrink-0" />
            <span className={clsx({ "hidden": collapsed })}>Search chat</span>
          </Link>
          <Link href="/" className="px-2 rounded-sm flex gap-3 py-2 text-md w-full hover:bg-gray-200">
            <Library className="text-black w-6 h-6 flex-shrink-0" />
            <span className={clsx({ "hidden": collapsed })}>Library</span>
          </Link>
        </div>
      </div>

      {/* Middle Section (Media, Project, Footer) */}
      {!collapsed && (
        <>
          <div className="mx-2">
            <Link href="/" className="px-2 rounded-sm flex gap-3 py-2 text-md w-full hover:bg-gray-200">
              <ImageGenerator className="text-black w-6 h-6" />
              Media Generator
            </Link>
          </div>
          <div className="mx-2">
            <Link href="/" className="px-2 rounded-sm flex gap-3 py-2 text-md w-full hover:bg-gray-200">
              <NewProject className="text-black w-6 h-6" />
              New Project
            </Link>
          </div>

          
        </>
      )}

      {/* Chats Section (Growable bottom) */}
      {!collapsed && (
        <div className="flex-grow overflow-y-auto m-2 pb-4">
          <p className="px-2 text-blue-500 text-md">Chats</p>
          <div className="mt-2">
            {isLoading ? (
              <div className="p-2 text-gray-500">Loading chats...</div>
            ) : error ? (
              <div className="p-2 text-red-500">Error loading chats</div>
            ) : Array.isArray(chats) && chats.length > 0 ? (
              chats
                .filter(chat => chat && chat.id)
                .map((chat) => (
                  <div key={chat.id} className="group relative">
                    <Link
                      href={`/c/${chat.id}`}
                      className={clsx(
                        "block p-2 pr-8 rounded-sm text-md hover:bg-gray-200 truncate",
                        currentChatId === chat.id && "bg-gray-200"
                      )}
                    >
                      {chat.title || 'Untitled Chat'}
                    </Link>
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      disabled={deletingId === chat.id}
                      className={clsx(
                        "absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors",
                        "opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                      title="Delete chat"
                    >
                      {deletingId === chat.id ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))
            ) : (
              <div className="p-2 text-gray-500 text-sm">No chats yet</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
