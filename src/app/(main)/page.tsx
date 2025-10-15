"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import ChatInput from "@/components/chatinput/chatinput";
import { useEffect } from "react";
export default function MainPage() {
    const router = useRouter();

    const checkTokens = async() => {
        const data = await axios.get("/api/chat/limit");
        console.log(data);
    }

    const sendPrompt = async (prompt: String) => {
        const newChat = await axios.post("/api/chat/create", { prompt: prompt });

        console.log(newChat);
        if(newChat.status === 200){
            router.push(`/c/${newChat.data.chatId}`);
        }
    }

    useEffect(()=>{
        checkTokens()
    })

    return (
        <div className="flex flex-col min-h-[40vh] justify-end items-center">
            <h1 className="text-2xl">What are you working on ?</h1>
            <div className="w-2xl mt-6">
            <ChatInput sendPrompt={(e:any)=>sendPrompt(e)}/>
            </div>
        </div>
    )
}