"use client" 
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page when the component mounts
    router.push('/');
  }, [router]);

  // Optional: You can show a loading message or return null
  return null;
}
