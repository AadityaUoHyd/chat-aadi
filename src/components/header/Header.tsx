'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, Sparkle, MessageCircleDashed } from "lucide-react";

export default function Header() {
  const searchParams = useSearchParams();
  const modelFromUrl = searchParams.get('model') || 'mistral-tiny';

  const [isMounted, setIsMounted] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState('mistral-tiny');
  const [currentPlan, setCurrentPlan] = useState<'Free' | 'Pro' | 'Business'>('Free'); // 👈 default plan
  const modelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

    useEffect(() => {
    const modelFromUrl = searchParams.get('model') || 'mistral-tiny';
    setCurrentModel(modelFromUrl);
  }, [searchParams]);  // run this effect whenever searchParams change


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

  const models = ['mistral-tiny (free)', 'qwen-7b', 'gpt-4-turbo', 'deepseek-v3.1', 'grok-4', 'llama-3-8b', 'claude-3-5-sonnet', 'gemini-2.0-flash'];

  return (
    <header className="p-4 flex items-center justify-between border-b border-gray-200 bg-white">
      
      {/* Left side - Model Selector */}
<div className="relative" ref={modelRef} style={{ minWidth: '150px' }}>
  <Button
    variant="ghost"
    className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 w-full justify-start"
    onClick={() => setIsModelOpen(!isModelOpen)}
  >
    <span className="font-medium truncate">{currentModel}</span>
    <ChevronDown className={`w-4 h-4 transition-transform ${isModelOpen ? 'rotate-180' : ''}`} />
  </Button>

  {/* Dropdown */}
  <div
    className={`absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-20 border border-gray-100 transition-opacity duration-150 ${
      isModelOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
    }`}
  >
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
</div>


      {/* Center - Current Plan & Upgrade */}
          {/* Center - Current Plan & Upgrade */}
<div className="flex items-center gap-x-4">
  {/* Current Plan Display */}
  <span
    className={`text-xs font-medium tracking-wide px-3.5 py-1.5 rounded-full border ${
      currentPlan === 'Free'
        ? 'bg-white text-gray-700 border-gray-200'
        : currentPlan === 'Pro'
        ? 'bg-blue-50 text-blue-600 border-blue-200'
        : 'bg-green-50 text-green-600 border-green-200'
    } shadow-sm`}
  >
    Plan: {currentPlan}
  </span>

  {/* Upgrade Button */}
  <Button
    variant="ghost"
    className="flex items-center gap-1 text-sm font-medium text-[#5d5bd0] bg-[#f4f4ff] hover:bg-[#eaeaff] px-4 py-2 rounded-md shadow-sm transition-colors"
    onClick={() => router.push('/subscription')}
  >
    <Sparkle className="h-4 w-4" />
    Upgrade
  </Button>
</div>



      {/* Right side - Message Icon with Tooltip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="rounded-[100%] hover:bg-gray-100 p-2 cursor-pointer" onClick={() => router.push('/')}>
            <MessageCircleDashed width={20} height={20} className="text-gray-700" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Turn on temporary chat</p>
        </TooltipContent>
      </Tooltip>
    </header>
  );
}
