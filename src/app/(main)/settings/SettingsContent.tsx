'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { LogOut, Trash2, User2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from "../../../components/ui/button"

export default function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialModel = searchParams.get('model') || 'mistral-tiny';
  const [modelPreference, setModelPreference] = useState(initialModel);

  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  // Rest of your existing component code...
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Account</h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
              <User2 className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="font-medium">{session.user?.name || 'User'}</p>
              <p className="text-sm text-gray-500">{session.user?.email}</p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-3">Model Preference</h3>
            <select
              value={modelPreference}
              onChange={(e) => setModelPreference(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="mistral-tiny">Mistral Tiny (Fastest)</option>
              <option value="mistral-small">Mistral Small (Balanced)</option>
              <option value="mistral-medium">Mistral Medium (Most Capable)</option>
            </select>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-3">Notifications</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="notifications" className="ml-2 text-sm">
                Email notifications
              </label>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-3">Theme</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => setTheme('light')}
                className={`px-4 py-2 rounded-md ${
                  theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-4 py-2 rounded-md ${
                  theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100'
                }`}
              >
                Dark
              </button>
            </div>
          </div>
          
          <div className="pt-6 border-t">
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Button
                variant="outline"
                className="flex items-center justify-center"
                onClick={() => {
                  // Handle account deletion
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center justify-center"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
