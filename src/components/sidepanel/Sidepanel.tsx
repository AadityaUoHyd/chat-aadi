// components/sidepanel/Sidepanel.tsx
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

  if (!isClient) {
    return (
      <div className={`h-full bg-gray-50 border-r border-gray-200 ${collapsed ? 'w-[50px]' : 'w-[260px]'}`} />
    );
  }

  return (
    <div className={clsx(
      "bg-gray-50 h-full flex flex-col border-r border-gray-200 transition-all duration-150",
      collapsed ? 'w-[50px]' : 'w-[260px]'
    )}>
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex justify-between p-4 group">
          <button 
            className={clsx("cursor-pointer flex items-center", {
              'group-hover:hidden': collapsed
            })}
            onClick={() => setCollapsed(false)}
          >
            <div className="flex items-center gap-2">
              <img
                src="/chatAadi.png"
                alt="ChatAadi Logo"
                className="w-10 h-10 object-contain"
              />
              {!collapsed && <span className="text-xl font-semibold text-gray-800">ChatAadi</span>}
            </div>
          </button>
          <button 
            className={clsx("cursor-pointer", {
              "hidden group-hover:block": collapsed
            })} 
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <SidebarOpenIcon className="text-gray-600 h-6 w-6" />
            ) : (
              <SidebarCloseIcon className="text-gray-600 h-6 w-6" />
            )}
          </button>
        </div>
        
        {/* Navigation Links */}
        <div className="px-2 space-y-1">
          <Link href="/" className="px-2 rounded-sm flex gap-3 py-2 text-md w-full hover:bg-gray-200">
            <NewChat className="text-black w-6 h-6 flex-shrink-0" />
            {!collapsed && <span>New chat</span>}
          </Link>
          <Link href="/" className="px-2 rounded-sm flex gap-3 py-2 text-md w-full hover:bg-gray-200">
            <Search className="text-black w-6 h-6 flex-shrink-0" />
            {!collapsed && <span>Search chat</span>}
          </Link>
          <Link href="/" className="px-2 rounded-sm flex gap-3 py-2 text-md w-full hover:bg-gray-200">
            <Library className="text-black w-6 h-6 flex-shrink-0" />
            {!collapsed && <span>Library</span>}
          </Link>
        </div>

        {!collapsed && (
          <>
            <div className="mx-2 mt-2">
              <Link href="/" className="px-2 rounded-sm flex gap-3 py-2 text-md w-full hover:bg-gray-200">
                <ImageGenerator className="text-black w-6 h-6" />
                <span>Media Generator</span>
              </Link>
            </div>
            <div className="mx-2 mb-2">
              <Link href="/" className="px-2 rounded-sm flex gap-3 py-2 text-md w-full hover:bg-gray-200">
                <NewProject className="text-black w-6 h-6" />
                <span>New Project</span>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Chats Section */}
      <div className="flex-1 min-h-0 flex flex-col">
        {!collapsed && (
          <div className="overflow-y-auto flex-1">
            <p className="px-4 text-blue-500 text-md sticky top-0 bg-gray-50 py-2 z-10">Chats</p>
            <div className="px-2">
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

      {/* Footer */}
<div className="mt-auto border-t border-gray-200 p-4">
  <div className="relative" ref={dropdownRef}>
    <button
      className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 transition-colors"
      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    >
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
        {session?.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            className="w-full h-full object-cover"
          />
        ) : (
          <User2 className="w-4 h-4 text-gray-600" />
        )}
      </div>
      <div className="text-left flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {session?.user?.name || 'User'}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {session?.user?.email || ''}
        </p>
      </div>
      <ChevronDown
        className={`w-4 h-4 text-gray-500 transition-transform ${
          isDropdownOpen ? 'rotate-180' : ''
        }`}
      />
    </button>

    {isDropdownOpen && (
      <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-lg shadow-lg py-1 z-20 border border-gray-100">
        <Link
          href="/about"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={() => setIsDropdownOpen(false)}
        >
          About
        </Link>
        <Link
          href="/profile"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={() => setIsDropdownOpen(false)}
        >
          Profile
        </Link>
        <Link
          href="/billing"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={() => setIsDropdownOpen(false)}
        >
          Billing
        </Link>
        <Link
          href="/team"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={() => setIsDropdownOpen(false)}
        >
          Team
        </Link>
        <Link
          href="/subscription"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={() => setIsDropdownOpen(false)}
        >
          Subscription
        </Link>
        <div className="h-px bg-gray-100 my-1"></div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </button>
      </div>
    )}
  </div>
</div>
    </div>
  );
}