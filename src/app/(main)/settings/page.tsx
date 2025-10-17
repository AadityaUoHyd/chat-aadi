'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { LogOut, Trash2, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [modelPreference, setModelPreference] = useState('GPT-4');

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please sign in to view settings</div>;
  }

  const models = ['mistral-tiny', 'qwen-7b', 'GPT-4', 'llama3.2', 'claude-3-5-sonnet', 'gemini-2.0-flash'];

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
            onChange={(e) => setModelPreference(e.target.value)}
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

      {/* Subscription */}
      <section className="bg-white shadow-sm rounded-xl p-6 mb-8 border">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Subscription</h2>
        <p className="text-gray-600">You're currently on the <strong>Free</strong> plan.</p>
        <Button
          className="mt-4 bg-[#5d5bd0] text-white hover:bg-[#4a47a3]"
          onClick={() => window.location.href = '/subscription'}
        >
          Manage Subscription
        </Button>
      </section>

      {/* Danger Zone */}
      <section className="bg-white shadow-sm rounded-xl p-6 border border-red-200">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
        <div className="flex flex-col gap-4 md:flex-row">
          <Button variant="outline" className="text-red-500 border-red-300 hover:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
          <Button variant="outline" className="text-gray-600 hover:bg-gray-100">
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </section>
    </div>
  );
}
