/**
 * TanStack Query Hooks for Chats/Messages
 * Replaces useEffect + fetch with React Query
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// Types
interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  read: boolean;
}

interface ChatStats {
  totalConversations: number;
  totalMessages: number;
  unreadCount: number;
  activeUsers: number;
}

// API functions
const fetchConversations = async (): Promise<Conversation[]> => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const response = await fetch('/api/v1/messages/conversations', {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch conversations');
  }

  const data = await response.json();
  return data.data || [];
};

const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  // Extract userId from conversationId (format: "user_xxxxx")
  const userId = conversationId.split('_')[1];
  
  const response = await fetch(`/api/v1/messages/user/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }

  const data = await response.json();
  return data.data || [];
};

const fetchUnreadCount = async (): Promise<number> => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const response = await fetch('/api/v1/messages/unread/count', {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch unread count');
  }

  const data = await response.json();
  return data.data?.count || 0;
};

const fetchChatStats = async (): Promise<ChatStats> => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const response = await fetch('/api/v1/messages/stats', {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch chat stats');
  }

  const data = await response.json();
  return data.data;
};

const sendMessage = async ({ conversationId, content }: { conversationId: string; content: string }): Promise<Message> => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const response = await fetch('/api/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ conversationId, content }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  const data = await response.json();
  return data.data;
};

const markMessageAsRead = async (messageId: string): Promise<void> => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const response = await fetch(`/api/v1/messages/${messageId}/read`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to mark message as read');
  }
};

const deleteMessage = async (messageId: string): Promise<void> => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const response = await fetch(`/api/v1/messages/${messageId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to delete message');
  }
};

const searchUsers = async (query: string): Promise<any[]> => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const response = await fetch(`/api/v1/messages/users/search?query=${encodeURIComponent(query)}&limit=20`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to search users');
  }

  const data = await response.json();
  return data.data || [];
};

// Query Keys
export const chatQueryKeys = {
  all: ['chats'] as const,
  conversations: () => [...chatQueryKeys.all, 'conversations'] as const,
  messages: (conversationId: string) => [...chatQueryKeys.all, 'messages', conversationId] as const,
  unreadCount: () => [...chatQueryKeys.all, 'unreadCount'] as const,
  stats: () => [...chatQueryKeys.all, 'stats'] as const,
  search: (query: string) => [...chatQueryKeys.all, 'search', query] as const,
};

// Hooks
export function useConversations(options?: {
  enabled?: boolean;
  refetchInterval?: number | false;
}) {
  return useQuery({
    queryKey: chatQueryKeys.conversations(),
    queryFn: fetchConversations,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: options?.refetchInterval || false,
    enabled: options?.enabled !== false,
  });
}

export function useMessages(conversationId: string, options?: {
  enabled?: boolean;
  refetchInterval?: number | false;
}) {
  return useQuery({
    queryKey: chatQueryKeys.messages(conversationId),
    queryFn: () => fetchMessages(conversationId),
    enabled: !!conversationId && (options?.enabled !== false),
    staleTime: 30 * 1000, // 30 seconds for messages
    refetchInterval: options?.refetchInterval || false,
  });
}

export function useUnreadCount(options?: {
  enabled?: boolean;
  refetchInterval?: number | false;
}) {
  return useQuery({
    queryKey: chatQueryKeys.unreadCount(),
    queryFn: fetchUnreadCount,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: options?.refetchInterval || 30000, // Refetch every 30 seconds
    enabled: options?.enabled !== false,
  });
}

export function useChatStats(options?: {
  enabled?: boolean;
  refetchInterval?: number | false;
}) {
  return useQuery({
    queryKey: chatQueryKeys.stats(),
    queryFn: fetchChatStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: options?.refetchInterval || false,
    enabled: options?.enabled !== false,
  });
}

export function useSearchUsers(query: string, options?: {
  enabled?: boolean;
  debounceMs?: number;
}) {
  return useQuery({
    queryKey: chatQueryKeys.search(query),
    queryFn: () => searchUsers(query),
    enabled: !!query && query.length >= 2 && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry search queries
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (newMessage, variables) => {
      // Invalidate messages for this conversation
      queryClient.invalidateQueries({ 
        queryKey: chatQueryKeys.messages(variables.conversationId) 
      });
      
      // Update conversations list to show new last message
      queryClient.invalidateQueries({ 
        queryKey: chatQueryKeys.conversations() 
      });
      
      // Update unread count
      queryClient.invalidateQueries({ 
        queryKey: chatQueryKeys.unreadCount() 
      });

      toast.success('Message sent successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send message');
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markMessageAsRead,
    onSuccess: (_, messageId) => {
      // Update the specific message in cache
      queryClient.setQueriesData(
        { queryKey: chatQueryKeys.messages, exact: false },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          return oldData.map((message: Message) =>
            message.id === messageId ? { ...message, read: true } : message
          );
        }
      );
      
      // Update unread count
      queryClient.invalidateQueries({ 
        queryKey: chatQueryKeys.unreadCount() 
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark message as read');
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMessage,
    onMutate: async (messageId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: chatQueryKeys.messages, 
        exact: false 
      });

      // Find the message and its conversation
      let messageToDelete: Message | null = null;
      let conversationId: string | null = null;

      queryClient.getQueriesData({ 
        queryKey: chatQueryKeys.messages, 
        exact: false 
      }).forEach(([queryKey, data]: any) => {
        if (Array.isArray(data)) {
          const found = data.find((msg: Message) => msg.id === messageId);
          if (found) {
            messageToDelete = found;
            conversationId = queryKey[2]; // conversationId is at index 2
          }
        }
      });

      // Optimistically remove the message
      queryClient.setQueriesData(
        { queryKey: chatQueryKeys.messages, exact: false },
        (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          return oldData.filter((msg: Message) => msg.id !== messageId);
        }
      );

      return { messageToDelete, conversationId };
    },
    onError: (error: any, variables, context) => {
      toast.error(error.message || 'Failed to delete message');
    },
    onSuccess: () => {
      toast.success('Message deleted successfully!');
    },
    onSettled: () => {
      // Refetch conversations and unread count
      queryClient.invalidateQueries({ 
        queryKey: chatQueryKeys.conversations() 
      });
      queryClient.invalidateQueries({ 
        queryKey: chatQueryKeys.unreadCount() 
      });
    },
  });
}

// Infinite scroll for messages
export function useInfiniteMessages(conversationId: string, options?: {
  limit?: number;
  enabled?: boolean;
}) {
  const limit = options?.limit || 50;

  return useInfiniteQuery({
    queryKey: chatQueryKeys.messages(conversationId),
    queryFn: async ({ pageParam = 0 }) => {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const userId = conversationId.split('_')[1];
      
      const response = await fetch(
        `/api/v1/messages/user/${userId}?page=${pageParam}&limit=${limit}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      return {
        data: data.data || [],
        nextPage: pageParam + 1,
        hasMore: data.data?.length === limit,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
    enabled: !!conversationId && (options?.enabled !== false),
    staleTime: 30 * 1000,
  });
}

// Hook for real-time updates (WebSocket integration)
export function useRealtimeChat(conversationId?: string) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    // This would integrate with your WebSocket service
    // For now, it's a placeholder for the real-time functionality

    const handleNewMessage = (message: Message) => {
      // Update messages cache
      queryClient.setQueriesData(
        { queryKey: chatQueryKeys.messages(message.conversationId) },
        (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return [message];
          return [...oldData, message];
        }
      );

      // Update conversations cache
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
      
      // Update unread count if message is not from current user
      if (message.senderId !== getCurrentUserId()) {
        queryClient.invalidateQueries({ queryKey: chatQueryKeys.unreadCount() });
      }
    };

    const handleReadReceipt = (messageId: string) => {
      // Update message read status
      queryClient.setQueriesData(
        { queryKey: chatQueryKeys.messages, exact: false },
        (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          return oldData.map((msg: Message) =>
            msg.id === messageId ? { ...msg, read: true } : msg
          );
        }
      );
    };

    // Subscribe to WebSocket events
    // socket.on('newMessage', handleNewMessage);
    // socket.on('messageRead', handleReadReceipt);

    return () => {
      // Unsubscribe from WebSocket events
      // socket.off('newMessage', handleNewMessage);
      // socket.off('messageRead', handleReadReceipt);
    };
  }, [queryClient, conversationId]);
}

// Helper function to get current user ID
function getCurrentUserId(): string {
  // This would come from your auth context
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.id || '';
}

// Hook for optimistic updates
export function useOptimisticSendMessage() {
  const queryClient = useQueryClient();

  return (conversationId: string, content: string) => {
    // Create optimistic message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: getCurrentUserId(),
      senderName: 'You',
      content,
      createdAt: new Date().toISOString(),
      read: false,
    };

    // Add optimistic message to cache
    queryClient.setQueriesData(
      { queryKey: chatQueryKeys.messages(conversationId) },
      (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) return [optimisticMessage];
        return [...oldData, optimisticMessage];
      }
    );

    // Return rollback function
    return () => {
      queryClient.setQueriesData(
        { queryKey: chatQueryKeys.messages(conversationId) },
        (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          return oldData.filter((msg: Message) => msg.id !== optimisticMessage.id);
        }
      );
    };
  };
}
