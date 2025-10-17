'use client';

import { useEffect, useState, useRef } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown, Sparkle, LogOut, User2 } from "lucide-react";
import { useSession } from 'next-auth/react';

export default function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

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

  if (!isMounted) return null;

  const user = session?.user;

  return (
    <header className="p-4 flex items-center justify-between">
      {/* User Section */}
      <div className="flex items-center gap-4">
        <div className="relative flex items-center gap-3" ref={dropdownRef}>
          <div className="shrink-0 w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden">
            {!imageError && user?.image ? (
              <img
                src={user.image}
                alt={user.name || 'User'}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <User2 className="w-5 h-5 text-gray-500" />
            )}
          </div>

          <div>
            <div
              className="group flex items-center gap-1.5 cursor-pointer py-1"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="text-sm font-medium text-gray-800 group-hover:text-gray-600 transition-colors">
                {user?.name || user?.email || 'User'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg py-1.5 z-10 border border-gray-100">
              <div className="p-1">
                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile
                </Link>
                <Link href="/billing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Billing
                </Link>
                <Link href="/team" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Team
                </Link>
                <Link href="/subscription" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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
            </div>
          )}
        </div>
      </div>

      {/* ChatAadi Branding */}
      <div>
        <Button
          variant="outline"
          className="text-[#5d5bd0] border-0 bg-[#f1f1fb] hover:text-[#5d5bd0] hover:bg-[#f1f1fb] cursor-pointer"
          onClick={() => router.push('/about')}
        >
          <Sparkle className="mr-2" />
          ChatAadi
        </Button>
      </div>

      {/* Subscription Status */}
      <div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-medium text-gray-500">Free Plan</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push('/subscription');
            }}
            className="px-2.5 py-1 bg-white rounded-full border border-gray-200 text-xs font-medium 
              hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
          >
            Upgrade
          </button>
        </div>
      </div>
    </header>
  );
}
