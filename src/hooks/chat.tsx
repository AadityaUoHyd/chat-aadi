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
      (error as { status?: number; data?: unknown }).status = response.status;
      (error as { status?: number; data?: unknown }).data = data;

      console.error('API Error:', {
        url,
        status: response.status,
        statusText: response.statusText,
        data,
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
export const onErrorRetry = (
  error: unknown,
  key: string,
  config: unknown,
  revalidate: (opts: { retryCount: number }) => void,
  { retryCount }: { retryCount: number }
) => {
  if (typeof error === "object" && error !== null && "status" in error && (error as { status?: number }).status === 401) {
    return; // Don't retry on 401
  }

  if (retryCount >= 3) return;

  setTimeout(() => revalidate({ retryCount }), 5000);
};

// Delete a chat
export const deleteChat = async (chatId: string): Promise<boolean> => {
  if (!chatId || typeof chatId !== 'string') {
    console.error('Invalid chat ID provided:', chatId);
    throw new Error('Invalid chat ID');
  }

  console.log('Deleting chat with ID:', chatId);

  // Optimistically update the UI
  const currentChats = await mutate<Chat[]>(
    "/api/chat",
    undefined,
    { revalidate: false }
  ) as Chat[] | undefined;

  await mutate<Chat[]>(
    "/api/chat",
    currentChats?.filter((chat) => chat.id !== chatId) ?? [],
    false
  );

  try {
    const response = await fetch(`/api/chat/${chatId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      credentials: 'same-origin',
    });

    console.log('Delete response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Delete chat API error:', {
        status: response.status,
        statusText: response.statusText,
        chatId,
        response: errorData,
      });

      // Re-fetch the chats to ensure we have the latest data
      await mutate("/api/chat");

      throw new Error(
        errorData.error ||
        errorData.message ||
        `Failed to delete chat: ${response.status} ${response.statusText}`
      );
    }

    // Re-validate the chats list
    await mutate("/api/chat");
    return true;
  } catch (error: unknown) {
    console.error('Error in deleteChat:', error);

    // Re-fetch the chats to ensure we have the latest data
    await mutate("/api/chat");

    if (error instanceof Error) {
      throw new Error(`Failed to delete chat: ${error.message}`);
    }

    throw new Error('An unknown error occurred while deleting the chat');
  }
};

export function useChats() {
  const {
    data: chats = [],
    error,
    isLoading,
    mutate: mutateChats,
  } = useSWR<Chat[]>(
    "/api/chat",
    fetcher,
    {
      onErrorRetry,
      revalidateOnFocus: false,
    }
  );

  function startPollingChat(chatId: string, onError?: (error: Error) => void) {
    const MAX_RETRIES = 5;
    let retryCount = 0;
    let isActive = true;

    const interval = setInterval(async () => {
      if (!isActive) return;

      try {
        const chat: Chat = await fetcher(`/api/chat/${chatId}`);
        if (!isActive) return;

        retryCount = 0;

        if (chat.title !== "New Chat") {
          stopPolling();

          mutateChats(
            (prev: Chat[] | undefined) =>
              prev?.map((c) => (c.id === chat.id ? chat : c)) ?? [],
            false
          );
        }
      } catch (error: unknown) {
        if (!isActive) return;

        retryCount++;

        if (typeof error === "object" && error !== null && "status" in error) {
          const typedError = error as { status?: number };

          if (typedError.status === 404) {
            onError?.(new Error('Chat not found'));
            stopPolling();
            return;
          }
        }

        console.error('Error polling chat:', error);

        if (retryCount >= MAX_RETRIES) {
          console.warn(`Max retries (${MAX_RETRIES}) reached, stopping polling`);
          onError?.(error instanceof Error ? error : new Error("Unknown error"));
          stopPolling();
        }
      }
    }, 3000);

    const cleanup = () => {
      isActive = false;
      clearInterval(interval);
    };

    function stopPolling() {
      cleanup();
    }

    return cleanup;
  }

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
    mutate: mutateChats,
  };
}
