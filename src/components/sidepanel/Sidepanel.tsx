"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Trash2, SidebarCloseIcon, SidebarOpenIcon, User2, ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import NewChat from "../icons/NewChat";
import Search from "../icons/Search";
import Library from "../icons/Library";
import Sora from "../icons/Sora";
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

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    // Set isClient to true after component mounts (client-side only)
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Only render the sidebar content on the client side
    if (!isClient) {
        return (
            <div className={`h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 ${collapsed ? 'w-16' : 'w-64'}`}>
                {/* Loading state or empty div with same dimensions */}
            </div>
        );
    }

    const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
            return;
        }

        setDeletingId(chatId);
        
        try {
            await deleteChat(chatId);
            
            // If the current chat is the one being deleted, redirect to home
            if (window.location.pathname.includes(chatId)) {
                router.push('/');
            }
        } catch (error: any) {
            console.error('Error deleting chat:', error);
            alert(error.message || 'Failed to delete chat. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className={clsx("bg-gray-50 transition-all duration-150 flex flex-col box-border h-[100vh] overflow-scroll border-r border-gray-200",
            collapsed ? 'w-[50px]' : 'w-[260px]'
        )}>
            <div className="sticky top-0 z-1 bg-gray-50">
                <div className="flex justify-between p-4 group">
                    <button className={clsx("cursor-pointer flex items-center justify-center",
                        {
                            'group-hover:hidden': collapsed
                        }
                    )}>
                        <div className="w-12 h-12 relative">
                            <img
                                src="/chatAadi.png"
                                alt="Chat Aadi"
                                className="w-full h-full"
                            />
                        </div>
                    </button>
                    <button className={clsx("cursor-pointer",
                        {
                            "hidden group-hover:block": collapsed
                        }
                    )} onClick={() => setCollapsed(!collapsed)}>
                        {
                            collapsed ?
                                <SidebarOpenIcon width={16} height={16} className="text-gray-600 h-6 w-6" />
                                :
                                <SidebarCloseIcon width={16} height={16} className="text-gray-600 h-6 w-6" />
                        }
                    </button>
                </div>
                <div className="px-2">
                    <Link href="/" className="px-2 rounded-sm flex gap-3 py-2 text-md w-full hover:bg-gray-200">
                        <NewChat className="text-black w-6 h-6 flex-shrink-0" />
                        <span className={clsx({
                            "hidden": collapsed
                        })}>New chat</span>
                    </Link>
                    <Link href="/" className="px-2 rounded-sm flex gap-3 py-2 text-md w-full hover:bg-gray-200">
                        <Search className="text-black w-6 h-6 flex-shrink-0" />
                        <span className={clsx({
                            "hidden": collapsed
                        })}>Search chat</span>
                    </Link>
                    <Link href="/" className="px-2 rounded-sm flex gap-3 py-2 text-md w-full hover:bg-gray-200">
                        <Library className="text-black w-6 h-6 flex-shrink-0" />
                        <span className={clsx({
                            "hidden": collapsed
                        })}>Library</span>
                    </Link>
                </div>
            </div>

            <div className={clsx({
                "hidden": collapsed
            })}>
                <div className={`my-6 mx-2`}>
                    <Link href="/" className="px-2 rounded-sm flex gap-3 py-2 text-md w-full hover:bg-gray-200">
                        <Sora className="text-black w-6 h-6" />
                        Media Generator
                    </Link>
                </div>
                <div className="my-6 mx-2">
                    <Link href="/" className="px-2 rounded-sm flex gap-3 py-2 text-md w-full hover:bg-gray-200">
                        <NewProject className="text-black w-6 h-6" />
                        New Project
                    </Link>
                </div>
                
                <div className="my-6 mx-2">
                <p className="px-2 text-gray-500 text-md">Chats</p>
                <div className="mt-2">
                    {isLoading ? (
                        <div className="p-2 text-gray-500">Loading chats...</div>
                    ) : error ? (
                        <div className="p-2 text-red-500">Error loading chats</div>
                    ) : Array.isArray(chats) && chats.length > 0 ? (
                        chats.map((element: any) => (
                            <div key={element.id} className="group relative">
                                <Link 
                                    href={`/c/${element.id}`} 
                                    className="block p-2 pr-8 rounded-sm text-md hover:bg-gray-200 truncate"
                                >
                                    {element.title}
                                </Link>
                                <button
                                    onClick={(e) => handleDeleteChat(element.id, e)}
                                    disabled={deletingId === element.id}
                                    className={clsx(
                                        "absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors",
                                        "opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600",
                                        "disabled:opacity-50 disabled:cursor-not-allowed"
                                    )}
                                    title="Delete chat"
                                >
                                    {deletingId === element.id ? (
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


            </div>

            <div className="sticky bottom-0 bg-gray-50 flex-0 inset-0 mt-auto border-t border-gray-200 p-2">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2 items-center">
                        <div className="rounded-[100%] w-7 h-7 bg-blue-400 text-white flex items-center justify-center flex-shrink-0">
                            <User2 className="w-4 h-4" />
                        </div>
                        <div className={clsx("flex flex-col gap-.5 flex-shrink-0 relative", {
                            "hidden": collapsed
                        })}>
                            <div 
                                className="flex items-center gap-1 cursor-pointer group"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <span className="text-sm text-gray-800 group-hover:text-gray-600">
                                    {session?.user?.email || 'User'}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>
                            <div className="flex items-center gap-2 py-1">
                                <span className="text-xs text-gray-500 semibold">Free</span>
                                <button className="px-2 py-1 bg-white rounded-2xl border border-gray-300 outline-0 text-xs font-medium cursor-pointer">Upgrade</button>
                            </div>
                            {isDropdownOpen && (
                                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Log out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={clsx("pr-2", {
                        "hidden": collapsed
                    })}>
                        
                    </div>
                </div>
            </div>

        </div>
    )
}