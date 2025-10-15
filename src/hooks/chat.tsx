"use client";

import useSWR, { mutate } from "swr";

type Chat = {
  id: string;
  title: string;
  createdAt: string;
};

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  if (response.status === 401) {
    // Redirect to sign-in page if not authenticated
    window.location.href = '/api/auth/signin';
    throw new Error('Unauthorized');
  }
  
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    (error as any).status = response.status;
    throw error;
  }
  
  return response.json();
};

// Add error boundary for SWR
export const onErrorRetry = (error: any, key: string, config: any, revalidate: any, { retryCount }: { retryCount: number }) => {
  // Don't retry on 401
  if (error.status === 401) return;
  
  // Only retry up to 3 times
  if (retryCount >= 3) return;
  
  // Retry after 5 seconds
  setTimeout(() => revalidate({ retryCount }), 5000);
};

export function useChats() {
  // Fetch all chats (cached globally by SWR)
  const { data: chats = [], error, isLoading } = useSWR<Chat[]>(
    "/api/chat", 
    fetcher,
    {
      onErrorRetry: onErrorRetry,
      revalidateOnFocus: false, // Optional: prevent refetching when window regains focus
    }
  );

  // Poll a specific chat until title updates
  async function startPollingChat(chatId: string) {
    const interval = setInterval(async () => {
      const chat: Chat = await fetcher(`/api/chat/${chatId}`);

      if (chat.title !== "New Chat") {
        clearInterval(interval);

        // Update this chat in cache optimistically
        mutate(
          "/api/chat",
          (prev: Chat[] | undefined) =>
            prev?.map((c) => (c.id === chat.id ? chat : c)) ?? [],
          false // don't re-fetch yet
        );
      }
    }, 3000);
  }

  // 🔹 Refresh all chats manually (optional)
  function refreshChats() {
    mutate("/api/chat"); // tells SWR to re-fetch
  }

  return { chats, error, isLoading, startPollingChat, refreshChats };
}
