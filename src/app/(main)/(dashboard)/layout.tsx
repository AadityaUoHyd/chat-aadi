import { redirect } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  redirect('/(main)');
  
  // This return is just to satisfy TypeScript, it won't be reached
  return null;
}
