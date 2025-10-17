"use client";

import useSWR, { mutate } from "swr";

type Chat = {
  id: string;
  title: string;
  createdAt: string;
};

const fetcher = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
    });
    
    const data = await response.json().catch(() => ({}));
    
    if (response.status === 401) {
      window.location.href = '/login';
      throw new Error('Unauthorized - Please log in again');
    }
    
    if (!response.ok) {
      const error = new Error(data.message || 'An error occurred while processing your request');
      (error as any).status = response.status;
      (error as any).data = data;
      console.error('API Error:', { 
        url, 
        status: response.status, 
        statusText: response.statusText,
        data 
      });
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Fetcher error:', error);
    throw error;
  }
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

  // Delete a chat with better error handling
  async function deleteChat(chatId: string) {
    if (!chatId) {
      throw new Error('Chat ID is required');
    }
    
    try {
      // Optimistically update the UI
      await mutate(
        "/api/chat",
        (prev: Chat[] | undefined) => prev?.filter(chat => chat.id !== chatId) ?? [],
        false
      );

      // Send the delete request
      const response = await fetch(`/api/chat/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete chat');
      }

      // Revalidate the cache
      await mutate("/api/chat");
      return true;
    } catch (error: any) {
      console.error('Error deleting chat:', error);
      
      // Revert the optimistic update
      await mutate("/api/chat");
      
      // Provide more specific error messages
      if (error.message.includes('404')) {
        throw new Error('Chat not found or already deleted');
      } else if (error.message.includes('401')) {
        throw new Error('Please log in to delete chats');
      } else if (error.message.includes('403')) {
        throw new Error('You do not have permission to delete this chat');
      } else {
        throw new Error(error.message || 'Failed to delete chat. Please try again.');
      }
    }
  }

export function useChats() {
  // Fetch all chats (cached globally by SWR)
  const { data: chats = [], error, isLoading, mutate: mutateChats } = useSWR<Chat[]>(
    "/api/chat", 
    fetcher,
    {
      onErrorRetry: onErrorRetry,
      revalidateOnFocus: false, // Optional: prevent refetching when window regains focus
    }
  );

  // Poll a specific chat until title updates
  function startPollingChat(chatId: string, onError?: (error: any) => void) {
    const MAX_RETRIES = 5;
    let retryCount = 0;
    let isActive = true;
    
    const interval = setInterval(async () => {
      if (!isActive) return;
      
      try {
        const chat: Chat = await fetcher(`/api/chat/${chatId}`);
        if (!isActive) return;
        
        retryCount = 0; // Reset retry count on successful fetch

        if (chat.title !== "New Chat") {
          stopPolling();
          // Update this chat in cache optimistically
          mutateChats(
            (prev: Chat[] | undefined) =>
              prev?.map((c) => (c.id === chat.id ? chat : c)) ?? [],
            false
          );
        }
      } catch (error: any) {
        if (!isActive) return;
        
        retryCount++;
        
        // If we get a 404, the chat was likely deleted
        if (error.status === 404) {
          onError?.(new Error('Chat not found'));
          stopPolling();
          return;
        }
        
        console.error('Error polling chat:', error);
        
        // Stop after max retries
        if (retryCount >= MAX_RETRIES) {
          console.warn(`Max retries (${MAX_RETRIES}) reached, stopping polling`);
          onError?.(error);
          stopPolling();
        }
      }
    }, 3000);
    
    // Return cleanup function
    const cleanup = () => {
      isActive = false;
      clearInterval(interval);
    };
    
    function stopPolling() {
      cleanup();
    }
    
    return cleanup;
  }

  // 🔹 Refresh all chats manually (optional)
  async function refreshChats() {
    await mutateChats();
  }

  return { 
    chats, 
    error, 
    isLoading, 
    startPollingChat, 
    refreshChats,
    deleteChat,
    mutate: mutateChats 
  };
}
