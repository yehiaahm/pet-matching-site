/**
 * Chat System - Main Chat Application
 * Combines conversation list and chat interface with real-time functionality
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { chatService, type Conversation } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { ConversationList } from './ConversationList';
import { ChatInterface } from './ChatInterface';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface ChatSystemProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export function ChatSystem({ isOpen = true, onClose, className = '' }: ChatSystemProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  // Initialize chat service
  useEffect(() => {
    if (!user || !isOpen) return;

    const initializeChat = async () => {
      try {
        const connected = await chatService.initialize(user.id, localStorage.getItem('accessToken') || '');
        setIsConnected(connected);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        setIsConnected(false);
      }
    };

    initializeChat();

    // Set up connection listener
    const unsubscribeConnection = chatService.onConnection((connected) => {
      setIsConnected(connected);
    });

    return () => {
      unsubscribeConnection();
    };
  }, [user, isOpen]);

  // Handle conversation selection
  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  // Handle back to conversation list
  const handleBack = () => {
    setSelectedConversation(null);
  };

  // Close chat service when component unmounts
  useEffect(() => {
    return () => {
      if (!isOpen) {
        chatService.disconnect();
      }
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="h-full bg-gray-50"
      >
        {/* Header */}
        <Card className="m-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">Messages</h1>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge variant="default" className="bg-red-500">
                  {unreadCount}
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <div className="flex h-[calc(100%-120px)]">
          {/* Conversation List - Always visible on desktop, hidden on mobile when chat is open */}
          <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-96 border-r`}>
            <ConversationList
              onConversationSelect={handleConversationSelect}
              selectedConversationId={selectedConversation?.id}
              className="h-full"
            />
          </div>

          {/* Chat Interface */}
          <div className={`${selectedConversation ? 'block' : 'hidden md:block'} flex-1`}>
            {selectedConversation ? (
              <ChatInterface
                conversation={selectedConversation}
                onBack={handleBack}
                className="h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-600">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Chat Button Component for triggering chat
interface ChatButtonProps {
  onClick: () => void;
  unreadCount?: number;
  className?: string;
}

export function ChatButton({ onClick, unreadCount = 0, className = '' }: ChatButtonProps) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`fixed bottom-4 right-4 z-40 ${className}`}
    >
      <Button
        onClick={onClick}
        size="lg"
        className="relative h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs bg-red-500"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
    </motion.div>
  );
}

// Chat Provider Component for managing chat state
interface ChatProviderProps {
  children: React.ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Listen for new messages to update unread count
  useEffect(() => {
    const unsubscribe = chatService.onConversation((conversation) => {
      if (conversation.unreadCount > 0) {
        setUnreadCount(prev => prev + conversation.unreadCount);
      }
    });

    return unsubscribe;
  }, []);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => {
    setIsChatOpen(false);
    // Reset unread count when chat is opened
    setUnreadCount(0);
  };

  return (
    <>
      {children}
      <ChatButton onClick={openChat} unreadCount={unreadCount} />
      <ChatSystem isOpen={isChatOpen} onClose={closeChat} />
    </>
  );
}
