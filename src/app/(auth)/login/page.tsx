"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  if (status === "loading") return <p className="p-4">Loading...</p>;
  if (session?.user) return redirect(callbackUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        window.location.href = callbackUrl;
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <header className="p-4 text-2xl font-bold">ChatAadi</header>
      <div className="max-w-xs m-auto text-center mt-[4rem]">
        <h1 className="text-3xl font-semibold">Log in or sign up</h1>
        <p className="text-gray-500 mt-3 text-sm leading-5">
          You'll get smarter responses and can upload files, images and more.
        </p>

        <div className="mt-7">
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-red-500 text-sm mb-2">{error}</div>
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 p-3 w-full rounded-lg placeholder:text-gray-400 outline-0"
                placeholder="Email address"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 p-3 w-full rounded-lg placeholder:text-gray-400 outline-0 mt-2"
                placeholder="Password"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className={`rounded-lg bg-black w-full p-3 text-white dark:bg-white dark:text-black my-4 cursor-pointer ${
                  isLoading ? "opacity-75" : ""
                }`}
              >
                {isLoading ? "Signing in..." : "Continue"}
              </button>
            </form>
          </div>

          <div className="flex gap-2 items-center my-4">
            <div className="flex-1 h-[1px] bg-gray-200"></div>
            <div className="px-1 font-bold text-xs text-gray-800">OR</div>
            <div className="flex-1 h-[1px] bg-gray-200"></div>
          </div>

          <div className="space-y-3">
            <button
              className="auth-btns w-full"
              onClick={() => signIn("google", { callbackUrl })}
            >
              <Image
                src={
                  "https://auth-cdn.oaistatic.com/assets/google-logo-NePEveMl.svg"
                }
                width={20}
                height={20}
                alt="Google Icon"
              />
              Continue with Google
            </button>

            
          </div>

          <p className="mt-6 text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-6">
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