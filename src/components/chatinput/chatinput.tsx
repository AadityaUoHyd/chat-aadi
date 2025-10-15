"use client";

import { ArrowUp, AudioLinesIcon, MicIcon, Plus } from "lucide-react";
import { Input } from "../ui/input";
import { useState } from "react";
import clsx from "clsx";

export default function ChatInput({ sendPrompt }: { sendPrompt: (message: string) => void }) {
  const [promptInput, setPromptInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // prevent page reload
    if (!promptInput.trim()) return;

    sendPrompt(promptInput); // send text
    setPromptInput("");      // clear input after sending
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex border border-gray-200 p-2 w-[100%] items-center rounded-4xl shadow bg-white">
        <Plus className="ml-2" strokeWidth={1} />

        <Input
          className="border-0 shadow-none outline-0 focus-visible:ring-0"
          type="text"
          placeholder="Ask anything"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
        />

        <div className="mr-2 cursor-pointer">
          <MicIcon height={20} width={20} className="text-gray-700" strokeWidth={1.5} />
        </div>

        <div
          className={clsx(
            "flex p-2 rounded-[100%] cursor-pointer",
            {
              "bg-black": promptInput.length > 0,
              "bg-gray-200 hover:bg-gray-100": promptInput.length === 0,
            }
          )}
        >
          {promptInput.length > 0 ? (
            <button type="submit">
              <ArrowUp height={20} width={20} className="text-white" />
            </button>
          ) : (
            <AudioLinesIcon height={20} width={20} className="text-gray-700" strokeWidth={1.5} />
          )}
        </div>
      </div>
    </form>
  );
}
