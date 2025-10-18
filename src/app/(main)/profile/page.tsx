'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/LoadingSpinner";
import dynamic from 'next/dynamic';
import { Settings, User2 } from 'lucide-react';

const Header = dynamic(() => import('@/components/header/Header'), {
  ssr: false
});

const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

export default function ProfilePage() {
  const [isClient, setIsClient] = useState(false);
  const { data: session, status } = useSession();
  const [memberSince, setMemberSince] = useState<string>('Loading...');
  const isLoading = status === 'loading';
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) {
      setMemberSince('N/A');
      return;
    }

    const user = session.user;
    setMemberSince(formatDate(user.createdAt as string) || 'New member');
  }, [session, status]);

  if (!isClient || isLoading) {
    return <LoadingSpinner />;
  }

  if (status !== 'authenticated' || !session?.user) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p>Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Your Profile</h1>

      {/* Profile Overview */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-6">
          <div className="h-24 w-24 rounded-full border border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center">
            {!imageError && session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <User2 className="w-12 h-12 text-white bg-gradient-to-br from-blue-400 to-blue-500 rounded-full p-2" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">{session.user.name || 'User'}</h2>
                <p className="text-gray-500">{session.user.email || 'No email provided'}</p>
              </div>
              <Button
                variant="outline"
                className="text-[#5d5bd0] border-0 bg-[#f1f1fb] hover:text-[#5d5bd0] hover:bg-[#f1f1fb] transition"
                onClick={() => router.push('/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Personal Information</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><span className="font-medium">Name:</span> {session.user.name || 'Not provided'}</li>
            <li><span className="font-medium">Email:</span> {session.user.email || 'Not provided'}</li>
            <li><span className="font-medium">Member Since:</span> {memberSince}</li>
          </ul>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Preferences</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><span className="font-medium">Theme:</span> System</li>
            <li><span className="font-medium">Language:</span> English</li>
            <li><span className="font-medium">Timezone:</span> (UTC+05:30) India</li>
          </ul>
        </div>
      </div>

      {/* 🔐 Security Info */}
      <div className="bg-white rounded-xl border p-5 shadow-sm">
        <h3 className="font-semibold text-lg mb-4 text-gray-800">Security</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li><span className="font-medium">Password Last Changed:</span> September 10, 2025</li>
          <li><span className="font-medium">Two-Factor Auth:</span> Enabled</li>
          <li><span className="font-medium">Last Login Location:</span> New Delhi, India</li>
        </ul>
      </div>

      {/* 📝 Profile Summary */}
      <div className="bg-white rounded-xl border p-5 shadow-sm">
        <h3 className="font-semibold text-lg mb-4 text-gray-800">Profile Summary</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          <strong>{session.user.name || 'User'}</strong> is a valued member of our platform since {memberSince}. With a preference for clean, minimal interfaces and productivity-driven tools, {session.user.name || 'User'} frequently engages with AI models and platform features. Stay tuned for more personalization features rolling out soon!
        </p>
      </div>

      {/* 📊 Activity Log (Placeholder) */}
      <div className="bg-white rounded-xl border p-5 shadow-sm">
        <h3 className="font-semibold text-lg mb-4 text-gray-800">Recent Activity</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>✅ Accessed GPT-4 for content generation</li>
          <li>🕒 Updated profile picture</li>
          <li>🔒 Enabled 2FA</li>
          <li>📦 Explored Business Plan features</li>
        </ul>
      </div>
    </div>
  );
}
