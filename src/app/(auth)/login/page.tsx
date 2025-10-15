"use client";

import { Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Login() {
    const {data:session, status} = useSession();
    console.log(session);
    if(status === "loading") return <p>Loading....</p>;
    if(session?.user) return redirect("/");
    return (
        <div>
            <header className="p-4 text-2xl font-bold">ChatAadi</header>
            <div className="max-w-xs m-auto text-center mt-[4rem]">
                <h1 className="text-3xl font-semibol">Log in or sign up</h1>
                <p className="text-gray-500 mt-3 text-sm leading-5">You'll get smarter responses and can uploaded files, images and more.</p>

                <div className="mt-7">
                    <div>
                        <form>
                            <input className="border border-gray-300 p-3 w-full rounded-4xl placeholder:text-gray-400 outline-0" placeholder="Email address" />
                            <button type="submit" className="rounded-4xl bg-black w-full p-3 text-white dark:bg-white dark:text-black my-7 cursor-pointer">Continue</button>
                        </form>
                    </div>
                    <div className="flex gap-2 items-center">
                        <div className="flex-1 h-[1px] bg-gray-200"></div>
                        <div className="px-1 font-bold text-xs text-gray-800">OR</div>
                        <div className="flex-1 h-[1px] bg-gray-200"></div>
                    </div>
                    <div className="mt-7">
                        <button className="auth-btns" onClick={()=>signIn("google")}>
                            <Image src={'https://auth-cdn.oaistatic.com/assets/google-logo-NePEveMl.svg'} width={20} height={20} alt="Google Icon" />
                            Continue with Google
                        </button>
                    </div>
                    <div className="mt-3">
                        <button className="auth-btns">
                            <Image src={'https://auth-cdn.oaistatic.com/assets/microsoft-logo-BUXxQnXH.svg'} width={20} height={20} alt="Google Icon" />
                            Continue with Microsoft Account
                        </button>
                    </div>
                    <div className="mt-3">
                        <button className="auth-btns">
                            <Image src={'https://auth-cdn.oaistatic.com/assets/apple-logo-vertically-balanced-rwLdlt8P.svg'} width={20} height={20} alt="Google Icon" />
                            Continue with Apple
                        </button>
                    </div>
                    <div className="mt-3">
                        <button className="auth-btns">
                            <Phone width={20} height={20} />
                            Continue with phone
                        </button>
                    </div>
                </div>

                <div className="mt-[4rem] flex justify-center items-center gap-2">
                    <Link href="/" className="underline underline-offset-1 text-gray-600 text-sm">Terms of Use</Link>
                    <div className="text-gray-600"> | </div>
                    <Link href="/" className="underline underline-offset-1 text-gray-600 text-sm">Privacy Policy</Link>
                </div>
            </div>
        </div>
    )
}