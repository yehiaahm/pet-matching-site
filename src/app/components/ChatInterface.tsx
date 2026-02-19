/**
 * Chat Interface Component - Production Ready
 * Full chat interface with message sending, history, and real-time updates
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Paperclip, Smile, MoreVertical, Edit, Trash2,
  Check, CheckCheck, Clock, Circle, Phone, Video, Info
} from 'lucide-react';
import { chatService, type Conversation, type Message } from '../services/chatService';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface ChatInterfaceProps {
  conversation: Conversation;
  onBack?: () => void;
  className?: string;
}

interface MessageWithActions extends Message {
  isEditing?: boolean;
  showActions?: boolean;
}

export function ChatInterface({
  conversation,
  onBack,
  className = ''
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<MessageWithActions[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<number>();

  // Get conversation info
  const getConversationInfo = (conv: Conversation) => {
    const otherParticipants = conv.participants.filter(p => p.userId !== chatService['userId']);
    return otherParticipants[0] || { name: 'Unknown User', avatar: '', isOnline: false };
  };

  const conversationInfo = getConversationInfo(conversation);

  // Load messages
  const loadMessages = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (!append) setLoading(true);
      
      const response = await chatService.getMessages(conversation.id, pageNum, 50);
      
      if (response.messages) {
        setMessages(prev => {
          const newMessages = append ? [...response.messages.reverse(), ...prev] : response.messages.reverse();
          // Remove duplicates
          const uniqueMessages = Array.from(
            new Map(newMessages.map(msg => [msg.id, msg])).values()
          );
          return uniqueMessages.map(msg => ({ ...msg, isEditing: false, showActions: false }));
        });
        setHasMore(response.hasMore);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversation.id]);

  // Initial load
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up real-time listeners
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Listen for new messages
    unsubscribers.push(
      chatService.onMessage(conversation.id, (message) => {
        setMessages(prev => {
          // Check if message already exists
          if (prev.find(msg => msg.id === message.id)) {
            // Update existing message
            return prev.map(msg => msg.id === message.id ? { ...msg, ...message } : msg);
          } else {
            // Add new message
            return [...prev, { ...message, isEditing: false, showActions: false }];
          }
        });
        scrollToBottom();
      })
    );

    // Listen for typing indicators
    unsubscribers.push(
      chatService.onTyping((indicator) => {
        if (indicator.conversationId === conversation.id) {
          setTypingUsers(prev => {
            if (indicator.isTyping) {
              return prev.includes(indicator.userName) 
                ? prev 
                : [...prev, indicator.userName];
            } else {
              return prev.filter(name => name !== indicator.userName);
            }
          });
        }
      })
    );

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [conversation.id]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load more messages (scrolling up)
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMessages(nextPage, true);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage('');

    try {
      const message = await chatService.sendMessage(conversation.id, content);
      if (message) {
        // Message will be added through the real-time listener
        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Show error state
      setMessages(prev => [...prev, {
        id: `temp-${Date.now()}`,
        conversationId: conversation.id,
        senderId: chatService['userId'] || '',
        receiverId: '',
        content,
        type: 'text',
        timestamp: new Date().toISOString(),
        status: 'failed'
      }]);
    }
  };

  // Handle typing indicator
  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      chatService.setTyping(conversation.id, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      chatService.setTyping(conversation.id, false);
    }, 1000);
  };

  // Edit message
  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      const success = await chatService.editMessage(messageId, newContent);
      if (success) {
        setEditingMessageId(null);
        setEditContent('');
      }
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const success = await chatService.deleteMessage(messageId, conversation.id);
      if (success) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  // Get message status icon
  const getMessageStatusIcon = (message: Message) => {
    if (message.senderId !== chatService['userId']) return null;
    
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

  // Format message content
  const formatMessageContent = (message: MessageWithActions) => {
    if (message.type === 'image') {
      return (
        <div className="space-y-2">
          <img 
            src={message.metadata?.imageUrl} 
            alt="Shared image" 
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
            onClick={() => window.open(message.metadata?.imageUrl, '_blank')}
          />
          {message.content && <p className="text-sm">{message.content}</p>}
        </div>
      );
    }

    if (message.type === 'file') {
      return (
        <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
          <Paperclip className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{message.metadata?.fileName || 'File'}</span>
        </div>
      );
    }

    return <p className="text-sm">{message.content}</p>;
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <Card className="m-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                ← Back
              </Button>
            )}
            <Avatar className="w-10 h-10">
              <AvatarImage src={conversationInfo.avatar} alt={conversationInfo.name} />
              <AvatarFallback>
                {conversationInfo.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">{conversationInfo.name}</h3>
              <p className="text-xs text-gray-500">
                {conversationInfo.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4">
          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}

          {/* Message List */}
          <AnimatePresence>
            {messages.map((message) => {
              const isOwn = message.senderId === chatService['userId'];
              const isEditing = editingMessageId === message.id;

              return (
                <motion.div
                  key={message.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  onMouseEnter={() => {
                    setMessages(prev => prev.map(msg => 
                      msg.id === message.id ? { ...msg, showActions: true } : msg
                    ));
                  }}
                  onMouseLeave={() => {
                    setMessages(prev => prev.map(msg => 
                      msg.id === message.id ? { ...msg, showActions: false } : msg
                    ));
                  }}
                >
                  <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                    {!isOwn && (
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={conversationInfo.avatar} alt={conversationInfo.name} />
                          <AvatarFallback className="text-xs">
                            {conversationInfo.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-gray-700">
                          {conversationInfo.name}
                        </span>
                      </div>
                    )}

                    <div className={`relative group ${
                      isOwn 
                        ? 'bg-indigo-600 text-white rounded-l-lg rounded-tr-lg' 
                        : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg'
                    } px-4 py-2`}>
                      {/* Message Content */}
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="bg-white text-gray-900"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleEditMessage(message.id, editContent)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingMessageId(null);
                                setEditContent('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        formatMessageContent(message)
                      )}

                      {/* Message Actions */}
                      {message.showActions && isOwn && !message.deletedAt && (
                        <div className={`absolute -top-8 ${isOwn ? 'right-0' : 'left-0'} flex gap-1`}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingMessageId(message.id);
                                  setEditContent(message.content);
                                }}
                              >
                                <Edit className="w-3 h-3 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteMessage(message.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-3 h-3 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>

                    {/* Message Status */}
                    <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-gray-500">
                        {chatService.formatMessageTime(message.timestamp)}
                      </span>
                      {getMessageStatusIcon(message)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm">
                    {typingUsers.length === 1 ? `${typingUsers[0]} is typing...` : 'Someone is typing...'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <Card className="m-4 p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <Smile className="w-5 h-5" />
          </Button>
          
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1"
          />
          
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="sm"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
