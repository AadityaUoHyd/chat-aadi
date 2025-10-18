'use client';

import { Suspense } from 'react';
import { SettingsContent } from './SettingsContent';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="space-y-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white shadow-sm rounded-xl p-6 border">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
