'use client';

import { useSession } from 'next-auth/react';

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-2xl text-gray-500">👤</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">{session?.user?.name}</h2>
            <p className="text-gray-500">{session?.user?.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Personal Information</h3>
            <div className="space-y-2 text-gray-600">
              <p>Name: {session?.user?.name}</p>
              <p>Email: {session?.user?.email}</p>
              <p>Member Since: {session?.user?.createdAt ? new Date(session.user.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Preferences</h3>
            <div className="space-y-2 text-gray-600">
              <p>Theme: System</p>
              <p>Language: English</p>
              <p>Timezone: (UTC+05:30) India</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
