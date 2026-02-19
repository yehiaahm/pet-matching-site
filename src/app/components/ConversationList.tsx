/**
 * Conversation List Component - Production Ready
 * Displays list of conversations with search, filtering, and real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MessageCircle, Users, Archive, Volume2, VolumeX, 
  MoreVertical, Check, CheckCheck, Clock, Circle, User
} from 'lucide-react';
import { chatService, type Conversation, type Message, type TypingIndicator } from '../services/chatService';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { scaleUpVariants } from '../../lib/animations';

interface ConversationListProps {
  onConversationSelect: (conversation: Conversation) => void;
  selectedConversationId?: string;
  className?: string;
}

export function ConversationList({
  onConversationSelect,
  selectedConversationId,
  className = ''
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState<Map<string, TypingIndicator[]>>(new Map());

  // Load conversations
  const loadConversations = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const response = await chatService.getConversations(pageNum, 20);
      
      if (response.conversations) {
        setConversations(prev => {
          const newConversations = append ? [...prev, ...response.conversations] : response.conversations;
          // Remove duplicates and sort by last message time
          const uniqueConversations = Array.from(
            new Map(newConversations.map(conv => [conv.id, conv])).values()
          );
          return uniqueConversations.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        });
        setHasMore(response.hasMore);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Set up real-time listeners
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Listen for conversation updates
    unsubscribers.push(
      chatService.onConversation((conversation) => {
        setConversations(prev => {
          const index = prev.findIndex(conv => conv.id === conversation.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = conversation;
            return updated.sort((a, b) => 
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
          } else {
            return [conversation, ...prev].sort((a, b) => 
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
          }
        });
      })
    );

    // Listen for typing indicators
    unsubscribers.push(
      chatService.onTyping((indicator) => {
        setTypingIndicators(prev => {
          const newMap = new Map(prev);
          const indicators = newMap.get(indicator.conversationId) || [];
          
          if (indicator.isTyping) {
            // Add typing indicator if not already present
            if (!indicators.find(ind => ind.userId === indicator.userId)) {
              newMap.set(indicator.conversationId, [...indicators, indicator]);
            }
          } else {
            // Remove typing indicator
            newMap.set(
              indicator.conversationId,
              indicators.filter(ind => ind.userId !== indicator.userId)
            );
          }
          
          return newMap;
        });
      })
    );

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const participantNames = conv.participants.map(p => p.name.toLowerCase()).join(' ');
      if (!participantNames.includes(query)) {
        return false;
      }
    }

    // Status filter
    switch (filter) {
      case 'unread':
        return conv.unreadCount > 0;
      case 'archived':
        return conv.isArchived;
      default:
        return !conv.isArchived;
    }
  });

  // Handle conversation actions
  const handleArchive = async (conversationId: string, isArchived: boolean) => {
    await chatService.archiveConversation(conversationId, isArchived);
  };

  const handleMute = async (conversationId: string, isMuted: boolean) => {
    await chatService.muteConversation(conversationId, isMuted);
  };

  const handleMarkAsRead = async (conversationId: string) => {
    await chatService.markAsRead(conversationId);
  };

  // Get conversation display info
  const getConversationInfo = (conversation: Conversation) => {
    const otherParticipants = conversation.participants.filter(p => p.userId !== chatService['userId']);
    const participant = otherParticipants[0];
    
    return {
      name: participant?.name || 'Unknown User',
      avatar: participant?.avatar,
      isOnline: participant?.isOnline || false,
      lastSeen: participant?.lastSeen
    };
  };

  // Get message status icon
  const getMessageStatusIcon = (message?: Message) => {
    if (!message) return null;
    
    switch (message.status) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      case 'sending':
        return <Clock className="w-4 h-4 text-gray-400 animate-spin" />;
      case 'failed':
        return <Circle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Get typing indicator text
  const getTypingText = (conversationId: string) => {
    const indicators = typingIndicators.get(conversationId) || [];
    if (indicators.length === 0) return null;
    
    const names = indicators.map(ind => ind.userName);
    if (names.length === 1) {
      return `${names[0]} is typing...`;
    } else if (names.length === 2) {
      return `${names[0]} and ${names[1]} are typing...`;
    } else {
      return `${names.length} people are typing...`;
    }
  };

  // Load more conversations
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadConversations(nextPage, true);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <Card className="m-4 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          <Button variant="outline" size="sm">
            <Users className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread
          </Button>
          <Button
            variant={filter === 'archived' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('archived')}
          >
            Archived
          </Button>
        </div>
      </Card>

      {/* Conversation List */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2">
          {loading && conversations.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No conversations found</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredConversations.map((conversation) => {
                const info = getConversationInfo(conversation);
                const typingText = getTypingText(conversation.id);
                const isSelected = conversation.id === selectedConversationId;

                return (
                  <motion.div
                    key={conversation.id}
                    layout
                    variants={scaleUpVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    onClick={() => {
                      onConversationSelect(conversation);
                      handleMarkAsRead(conversation.id);
                    }}
                  >
                    <Card className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''
                    }`}>
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={info.avatar} alt={info.name} />
                            <AvatarFallback>
                              <User className="w-6 h-6" />
                            </AvatarFallback>
                          </Avatar>
                          {info.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {info.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {conversation.lastMessage && 
                                  chatService.formatMessageTime(conversation.lastMessage.timestamp)
                                }
                              </span>
                              {getMessageStatusIcon(conversation.lastMessage)}
                            </div>
                          </div>

                          {/* Last message or typing indicator */}
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              {typingText ? (
                                <p className="text-sm text-indigo-600 italic">
                                  {typingText}
                                </p>
                              ) : conversation.lastMessage ? (
                                <p className="text-sm text-gray-600 truncate">
                                  {chatService.getMessagePreview(conversation.lastMessage)}
                                </p>
                              ) : (
                                <p className="text-sm text-gray-400 italic">
                                  No messages yet
                                </p>
                              )}
                            </div>

                            {/* Unread count and actions */}
                            <div className="flex items-center gap-2 ml-2">
                              {conversation.unreadCount > 0 && (
                                <Badge variant="default" className="bg-red-500 text-white">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                              
                              {conversation.isMuted && (
                                <VolumeX className="w-4 h-4 text-gray-400" />
                              )}

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleArchive(conversation.id, !conversation.isArchived);
                                    }}
                                  >
                                    <Archive className="w-4 h-4 mr-2" />
                                    {conversation.isArchived ? 'Unarchive' : 'Archive'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMute(conversation.id, !conversation.isMuted);
                                    }}
                                  >
                                    {conversation.isMuted ? (
                                      <Volume2 className="w-4 h-4 mr-2" />
                                    ) : (
                                      <VolumeX className="w-4 h-4 mr-2" />
                                    )}
                                    {conversation.isMuted ? 'Unmute' : 'Mute'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(conversation.id);
                                    }}
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    Mark as Read
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center py-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
