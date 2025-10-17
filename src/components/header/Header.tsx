// components/header/Header.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ChevronDown, Sparkle, MessageCircleDashed } from "lucide-react";

export default function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState('mistral-tiny');
  const modelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modelRef.current && !modelRef.current.contains(event.target as Node)) {
        setIsModelOpen(false);
      }
    }

    if (isModelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModelOpen]);

  if (!isMounted) return null;

  const models = ['mistral-tiny', 'qwen-7b', 'GPT-4', 'llama3.2', 'claude-3-5-sonnet', 'gemini-2.0-flash'];

  return (
    <header className="p-4 flex items-center justify-between border-b border-gray-200 bg-white">
      {/* Left side - Model Selector */}
      <div className="relative" ref={modelRef}>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
          onClick={() => setIsModelOpen(!isModelOpen)}
        >
          <span className="font-medium">{currentModel}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isModelOpen ? 'rotate-180' : ''}`} />
        </Button>
        {isModelOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20 border border-gray-100">
            {models.map((model) => (
              <button
                key={model}
                className={`w-full text-left px-4 py-2 text-sm ${
                  currentModel === model ? 'bg-gray-100 text-[#5d5bd0]' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => {
                  setCurrentModel(model);
                  setIsModelOpen(false);
                }}
              >
                {model}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Center - Branding */}
      <div className="flex items-center gap-2">
        <Button variant="outline" className="text-[#5d5bd0] border-0 bg-[#f1f1fb] hover:text-[#5d5bd0] hover:bg-[#f1f1fb] cursor-pointer"
                  onClick={() => router.push('/subscription')}>
          <Sparkle/>
          Upgrade to Go
        </Button>
      </div>

      {/* Right side - Upgrade Button */}
      <div>
        <button className="rounded-[100%] hover:bg-gray-100 p-2 cursor-pointer">
        <MessageCircleDashed width={20} height={20} className="text-gray-700" />
        </button>
      </div>
    </header>
  );
}