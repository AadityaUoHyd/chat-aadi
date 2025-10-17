'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardRedirect() {
  const pathname = usePathname();
  const router = useRouter();
  const subRoute = pathname.replace('/main/dashboard', '') || '/';

  // Handle redirect for root path
  useEffect(() => {
    if (subRoute === '/') {
      router.replace('/(main)');
    }
  }, [subRoute, router]);

  // If we're at the root path, don't render anything (will redirect)
  if (subRoute === '/') {
    return null;
  }

  // Render different content based on the sub-route
  const renderContent = () => {
    switch (subRoute) {
      case '/profile':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Profile</h1>
            <p>This is your profile page.</p>
          </div>
        );
      case '/billing':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Billing</h1>
            <p>Manage your billing information here.</p>
          </div>
        );
      case '/team':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Team</h1>
            <p>Manage your team members here.</p>
          </div>
        );
      case '/subscription':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Subscription</h1>
            <p>Upgrade your subscription plan.</p>
          </div>
        );
      default:
        // For any other route, show a 404-like message
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
            <p>The page you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex-1">
      {renderContent()}
    </div>
  );
}