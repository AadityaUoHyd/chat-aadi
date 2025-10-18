'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { AlertCircle, LogOut, Trash2, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialModel = searchParams.get('model') || 'mistral-tiny';
  const [modelPreference, setModelPreference] = useState(initialModel);
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    

    try {
      setIsDeleting(true);
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Sign out after successful deletion
      await signOut({ callbackUrl: '/register' });
      
      toast.success('Your account has been successfully deleted.');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  if (!session) {
    return <div>Please sign in to view settings</div>;
  }

  const models = ['mistral-tiny (free)', 'qwen-7b', 'gpt-4-turbo', 'deepseek-v3.1', 'grok-4', 'llama-3-8b', 'claude-3-5-sonnet', 'gemini-2.0-flash'];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Settings</h1>

      {/* Model Preferences */}
      <section className="bg-white shadow-sm rounded-xl p-6 mb-8 border">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Model Preference</h2>
        <div className="space-y-2">
          <label htmlFor="model" className="block text-gray-700 font-medium">
            Default AI Model
          </label>
          <select
            id="model"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            value={modelPreference}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const newModel = e.target.value;
              setModelPreference(newModel);
              router.replace(`/settings?model=${newModel}`);
            }}
          >
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Theme */}
      <section className="bg-white shadow-sm rounded-xl p-6 mb-8 border">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Appearance</h2>
        <div className="flex space-x-4">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            onClick={() => setTheme('light')}
          >
            Light
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            onClick={() => setTheme('dark')}
          >
            Dark
          </Button>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-white shadow-sm rounded-xl p-6 mb-8 border">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Notifications</h2>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Email notifications</span>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifications ? 'bg-[#5d5bd0]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Account Actions */}
      <section className="bg-white shadow-sm rounded-xl p-6 border">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Account</h2>
        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <User2 className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                </div>
                <div className="pt-4">
                  <AlertDialogDescription asChild>
                    <span className="block font-medium text-red-600">Warning: This action cannot be undone.</span>
                  </AlertDialogDescription>
                  <AlertDialogDescription asChild>
                    <span className="block mt-2">
                      All your data, including your profile, chats, and messages, will be permanently deleted.
                      You will be logged out and redirected to the registration page.
                    </span>
                  </AlertDialogDescription>
                </div>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                >
                  {isDeleting ? 'Deleting...' : 'Delete My Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </div>
  );
}
