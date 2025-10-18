'use client';

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const validateForm = () => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Redirect to login with success message
      router.push(`/login?registered=true&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="max-w-xs m-auto text-center m-4">
        <div className="flex justify-center">
          <img
            src="https://raw.githubusercontent.com/AadityaUoHyd/chat-aadi/refs/heads/main/screenshots/chatAadi.png"
            alt="Chat Aadi"
            className="w-full h-full"
          />
        </div>
        <h1 className="text-3xl font-semibold">Create an account</h1>
        <p className="text-gray-500 mt-3 text-sm leading-5">
          Join our community to get started
        </p>

        <div className="mt-7">
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-red-500 text-sm mb-2">{error}</div>
              )}
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                className="w-full p-2 border rounded"
                placeholder="Full Name"
                disabled={isLoading}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                className="w-full p-2 border rounded"
                placeholder="Email address"
                disabled={isLoading}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                className="w-full p-2 border rounded"
                placeholder="Password (min 6 characters)"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full p-2 bg-black text-white rounded-md ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              onClick={() => signIn('google', { callbackUrl })}
              className="w-full flex items-center justify-center gap-2 p-2 border rounded-md hover:bg-gray-50"
              disabled={isLoading}
            >
              <Image 
                src={"https://auth-cdn.oaistatic.com/assets/google-logo-NePEveMl.svg"}
                width={20} 
                height={20} 
                alt="Google Icon" 
              />
              <span>Continue with Google</span>
            </button>

            <p className="mt-4 text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                href={`/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
                className="text-blue-600 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-4 m-4">
        <Link href="/terms" className="text-sm text-gray-600 hover:underline">
          Terms of Use
        </Link>
        <span className="text-sm text-gray-400">|</span>
        <Link href="/privacy" className="text-sm text-gray-600 hover:underline">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RegisterForm />
    </Suspense>
  );
}
