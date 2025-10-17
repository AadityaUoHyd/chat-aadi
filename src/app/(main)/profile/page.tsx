'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Settings, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation'; 



// Dynamically import the Header component with SSR disabled
const Header = dynamic(() => import('@/components/header/Header'), {
  ssr: false
});

interface UserSession {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id: string;
  createdAt?: string | Date | null;
}

// Format date function to ensure consistent formatting
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


  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update memberSince when session changes
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) {
      setMemberSince('N/A');
      return;
    }

    const user = session.user;
    setMemberSince(formatDate(user.createdAt as string) || 'New member');
  }, [session, status]);

  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-20 w-20 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
            {!imageError && session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <User2 className="shrink-0 w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white shadow-sm" />
            )}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <div >
  <h2 className="text-xl font-semibold">{session.user.name || 'User'}</h2>
  <p className="text-gray-500">{session.user.email || 'No email provided'}</p>
</div>

          <div >
            <Button variant="outline" className="text-[#5d5bd0] border-0 bg-[#f1f1fb] hover:text-[#5d5bd0] hover:bg-[#f1f1fb] cursor-pointer"
              onClick={() => router.push('/settings')}>
              <Settings />Settings
            </Button>
          </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Personal Information</h3>
            <div className="space-y-2 text-gray-600">
              <p><span className="font-medium">Name:</span> {session.user.name || 'Not provided'}</p>
              <p><span className="font-medium">Email:</span> {session.user.email || 'Not provided'}</p>
              <p><span className="font-medium">Member Since:</span> {memberSince}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Preferences</h3>
            <div className="space-y-2 text-gray-600">
              <p><span className="font-medium">Theme:</span> System</p>
              <p><span className="font-medium">Language:</span> English</p>
              <p><span className="font-medium">Timezone:</span> (UTC+05:30) India</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
