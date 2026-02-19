/**
 * Example: Migrating MessagesDialog from useEffect + fetch to TanStack Query
 * This shows the before and after comparison
 */

// =====================================================
// BEFORE: useEffect + fetch approach
// =====================================================

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export function MessagesDialogBefore({ open, onClose }: MessagesDialogProps) {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

  useEffect(() => {
    if (open) {
      fetchConversations();
      fetchUnreadCount();
    }
  }, [open]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/v1/messages/conversations', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch conversations';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const userId = conversationId.split('_')[1];
      const response = await fetch(`/api/v1/messages/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch messages';
      setError(message);
      toast.error(message);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/v1/messages/unread/count', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data?.count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      const response = await fetch('/api/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: selectedConversation,
          content: messageText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage.data]);
      setMessageText('');
      toast.success('Message sent successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message';
      toast.error(message);
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    fetchMessages(conversationId);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Messages</DialogTitle>
        </DialogHeader>
        
        <div className="flex h-[500px]">
          {/* Conversations List */}
          <div className="w-1/3 border-r">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Conversations</h3>
              <Badge variant="secondary">{unreadCount}</Badge>
            </div>
            <div className="overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">Loading...</div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">{error}</div>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.id}
                    className={`p-3 cursor-pointer hover:bg-gray-100 ${
                      selectedConversation === conv.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleConversationSelect(conv.id)}
                  >
                    <div className="font-medium">{conv.participantName}</div>
                    <div className="text-sm text-gray-500 truncate">{conv.lastMessage}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`mb-4 ${
                    message.senderId === 'current-user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block max-w-xs px-3 py-2 rounded-lg ${
                      message.senderId === 'current-user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      sendMessage();
                    }
                  }}
                />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =====================================================
// AFTER: TanStack Query approach
// =====================================================

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { 
  useConversations, 
  useMessages, 
  useUnreadCount, 
  useSendMessage 
} from '../hooks/useChat-query';

export function MessagesDialogAfter({ open, onClose }: MessagesDialogProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  // TanStack Query hooks
  const { data: conversations, isLoading: conversationsLoading, error: conversationsError } = useConversations({
    enabled: open,
  });

  const { data: messages, isLoading: messagesLoading } = useMessages(selectedConversation || '', {
    enabled: !!selectedConversation,
  });

  const { data: unreadCount } = useUnreadCount({
    enabled: open,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const sendMessage = useSendMessage();

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    sendMessage.mutate(
      { conversationId: selectedConversation, content: messageText },
      {
        onSuccess: () => {
          setMessageText('');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Messages</DialogTitle>
        </DialogHeader>
        
        <div className="flex h-[500px]">
          {/* Conversations List */}
          <div className="w-1/3 border-r">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Conversations</h3>
              <Badge variant="secondary">{unreadCount || 0}</Badge>
            </div>
            <div className="overflow-y-auto">
              {conversationsLoading ? (
                <div className="p-4 text-center">Loading...</div>
              ) : conversationsError ? (
                <div className="p-4 text-center text-red-500">{conversationsError.message}</div>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.id}
                    className={`p-3 cursor-pointer hover:bg-gray-100 ${
                      selectedConversation === conv.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleConversationSelect(conv.id)}
                  >
                    <div className="font-medium">{conv.participantName}</div>
                    <div className="text-sm text-gray-500 truncate">{conv.lastMessage}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {messagesLoading ? (
                <div className="p-4 text-center">Loading messages...</div>
              ) : (
                messages?.map(message => (
                  <div
                    key={message.id}
                    className={`mb-4 ${
                      message.senderId === 'current-user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block max-w-xs px-3 py-2 rounded-lg ${
                        message.senderId === 'current-user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={sendMessage.isPending}
                >
                  {sendMessage.isPending ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =====================================================
// KEY DIFFERENCES AND BENEFITS
// =====================================================

/*
1. NO MORE MANUAL STATE MANAGEMENT
   Before: useState for loading, error, data
   After: useQuery provides isLoading, error, data automatically

2. AUTOMATIC CACHING
   Before: Data fetched every time component mounts
   After: Data cached for 2 minutes, no unnecessary requests

3. OPTIMISTIC UPDATES
   Before: Wait for server response before updating UI
   After: Instant UI update with rollback on error

4. BACKGROUND REFETCHING
   Before: Manual refetch needed for real-time updates
   After: Automatic refetch on window focus, reconnect, or interval

5. ERROR HANDLING
   Before: Manual try/catch with error state
   After: Built-in error handling with retry logic

6. LOADING STATES
   Before: Manual loading state management
   After: isLoading, isFetching, isSuccess, isError states provided

7. TYPE SAFETY
   Before: Manual type definitions needed
   After: Full TypeScript support with proper typing

8. DEVTOOLS
   Before: No debugging capabilities
   After: React Query DevTools for debugging cache and queries

9. PERFORMANCE
   Before: Multiple requests, no caching
   After: Smart caching, deduplication, background updates

10. CODE SIMPLICITY
   Before: 50+ lines of useEffect + fetch logic
   After: 5-10 lines with useQuery hook
*/
