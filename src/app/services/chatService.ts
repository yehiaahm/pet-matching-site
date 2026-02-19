/**
 * Chat Service - Real-time Chat System with Socket.io
 * Handles messaging, conversations, and real-time communication
 */

import { io, Socket } from 'socket.io-client';
import { safeGet } from '../utils/safeFetch';
import { getChatServiceUrl, getEnvironmentChatServiceUrl } from '../../env';

// Chat Configuration
const CHAT_BASE_URL = getEnvironmentChatServiceUrl();

// Message Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileUrl?: string;
    imageUrl?: string;
  };
  editedAt?: string;
  deletedAt?: string;
}

export interface Conversation {
  id: string;
  participants: Array<{
    userId: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen?: string;
  }>;
  lastMessage?: Message;
  unreadCount: number;
  isTyping: boolean;
  typingUsers: string[];
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  isMuted: boolean;
}

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  userName: string;
}

export interface OnlineUsers {
  [userId: string]: {
    isOnline: boolean;
    lastSeen?: string;
    status?: string;
  };
}

class ChatService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private messageCallbacks: Map<string, ((message: Message) => void)[]> = new Map();
  private conversationCallbacks: ((conversation: Conversation) => void)[] = [];
  private typingCallbacks: ((indicator: TypingIndicator) => void)[] = [];
  private onlineUsersCallbacks: ((users: OnlineUsers) => void)[] = [];
  private connectionCallbacks: ((connected: boolean) => void)[] = [];

  /**
   * Initialize chat service with user authentication
   */
  async initialize(userId: string, token: string): Promise<boolean> {
    try {
      this.userId = userId;

      // Initialize socket connection
      this.socket = io(CHAT_BASE_URL, {
        auth: { token, userId },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Set up socket event listeners
      this.setupSocketListeners();

      // Wait for connection
      return new Promise((resolve) => {
        this.socket?.on('connect', () => {
          console.log('✅ Chat service connected');
          this.connectionCallbacks.forEach(cb => cb(true));
          resolve(true);
        });

        this.socket?.on('connect_error', (error) => {
          console.error('❌ Chat service connection error:', error);
          this.connectionCallbacks.forEach(cb => cb(false));
          resolve(false);
        });
      });
    } catch (error) {
      console.error('❌ Failed to initialize chat service:', error);
      return false;
    }
  }

  /**
   * Set up socket event listeners
   */
  private setupSocketListeners() {
    if (!this.socket) return;

    // Message events
    this.socket.on('message', (message: Message) => {
      console.log('📨 Received message:', message);
      this.notifyMessageCallbacks(message);
    });

    this.socket.on('messageStatus', (data: { messageId: string; status: Message['status'] }) => {
      console.log('📝 Message status update:', data);
      // Update message status in local state
      this.notifyMessageCallbacks({
        ...{} as Message,
        id: data.messageId,
        status: data.status
      });
    });

    this.socket.on('messageEdited', (message: Message) => {
      console.log('✏️ Message edited:', message);
      this.notifyMessageCallbacks(message);
    });

    this.socket.on('messageDeleted', (data: { messageId: string; conversationId: string }) => {
      console.log('🗑️ Message deleted:', data);
      this.notifyMessageCallbacks({
        ...{} as Message,
        id: data.messageId,
        conversationId: data.conversationId,
        deletedAt: new Date().toISOString()
      });
    });

    // Conversation events
    this.socket.on('conversation', (conversation: Conversation) => {
      console.log('💬 Conversation update:', conversation);
      this.conversationCallbacks.forEach(cb => cb(conversation));
    });

    this.socket.on('conversationCreated', (conversation: Conversation) => {
      console.log('🆕 New conversation:', conversation);
      this.conversationCallbacks.forEach(cb => cb(conversation));
    });

    // Typing indicators
    this.socket.on('typing', (indicator: TypingIndicator) => {
      console.log('⌨️ Typing indicator:', indicator);
      this.typingCallbacks.forEach(cb => cb(indicator));
    });

    // Online status
    this.socket.on('onlineUsers', (users: OnlineUsers) => {
      console.log('👥 Online users update:', users);
      this.onlineUsersCallbacks.forEach(cb => cb(users));
    });

    // Connection events
    this.socket.on('disconnect', () => {
      console.log('🔌 Chat service disconnected');
      this.connectionCallbacks.forEach(cb => cb(false));
    });

    this.socket.on('reconnect', () => {
      console.log('🔄 Chat service reconnected');
      this.connectionCallbacks.forEach(cb => cb(true));
    });
  }

  /**
   * Send a message
   */
  sendMessage(conversationId: string, content: string, type: Message['type'] = 'text', metadata?: Message['metadata']): Promise<Message | null> {
    return new Promise((resolve) => {
      if (!this.socket || !this.userId) {
        resolve(null);
        return;
      }

      const message: Omit<Message, 'id' | 'timestamp' | 'status'> = {
        conversationId,
        senderId: this.userId,
        receiverId: '', // Will be set by server
        content,
        type,
        metadata
      };

      this.socket.emit('sendMessage', message, (response: { success: boolean; message?: Message; error?: string }) => {
        if (response.success && response.message) {
          resolve(response.message);
        } else {
          console.error('❌ Failed to send message:', response.error);
          resolve(null);
        }
      });
    });
  }

  /**
   * Edit a message
   */
  editMessage(messageId: string, newContent: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve(false);
        return;
      }

      this.socket.emit('editMessage', { messageId, newContent }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          console.error('❌ Failed to edit message:', response.error);
          resolve(false);
        }
      });
    });
  }

  /**
   * Delete a message
   */
  deleteMessage(messageId: string, conversationId: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve(false);
        return;
      }

      this.socket.emit('deleteMessage', { messageId, conversationId }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          console.error('❌ Failed to delete message:', response.error);
          resolve(false);
        }
      });
    });
  }

  /**
   * Mark messages as read
   */
  markAsRead(conversationId: string, messageIds?: string[]): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve(false);
        return;
      }

      this.socket.emit('markAsRead', { conversationId, messageIds }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          console.error('❌ Failed to mark as read:', response.error);
          resolve(false);
        }
      });
    });
  }

  /**
   * Start or stop typing indicator
   */
  setTyping(conversationId: string, isTyping: boolean): void {
    if (!this.socket || !this.userId) return;

    this.socket.emit('typing', {
      conversationId,
      userId: this.userId,
      isTyping
    });
  }

  /**
   * Create a new conversation
   */
  createConversation(participantIds: string[], initialMessage?: string): Promise<Conversation | null> {
    return new Promise((resolve) => {
      if (!this.socket || !this.userId) {
        resolve(null);
        return;
      }

      this.socket.emit('createConversation', { 
        participantIds, 
        initialMessage 
      }, (response: { success: boolean; conversation?: Conversation; error?: string }) => {
        if (response.success && response.conversation) {
          resolve(response.conversation);
        } else {
          console.error('❌ Failed to create conversation:', response.error);
          resolve(null);
        }
      });
    });
  }

  /**
   * Get user conversations
   */
  async getConversations(page: number = 1, limit: number = 20): Promise<{ conversations: Conversation[]; total: number; hasMore: boolean }> {
    try {
      const response = await safeGet(`${CHAT_BASE_URL}/api/conversations?page=${page}&limit=${limit}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to get conversations');
      }
    } catch (error) {
      console.error('❌ Failed to get conversations:', error);
      return { conversations: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get conversation messages
   */
  async getMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<{ messages: Message[]; total: number; hasMore: boolean }> {
    try {
      const response = await safeGet(`${CHAT_BASE_URL}/api/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to get messages');
      }
    } catch (error) {
      console.error('❌ Failed to get messages:', error);
      return { messages: [], total: 0, hasMore: false };
    }
  }

  /**
   * Search users
   */
  async searchUsers(query: string, limit: number = 10): Promise<ChatUser[]> {
    try {
      const response = await safeGet(`${CHAT_BASE_URL}/api/users/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to search users');
      }
    } catch (error) {
      console.error('❌ Failed to search users:', error);
      return [];
    }
  }

  /**
   * Archive or unarchive conversation
   */
  archiveConversation(conversationId: string, isArchived: boolean): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve(false);
        return;
      }

      this.socket.emit('archiveConversation', { conversationId, isArchived }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          console.error('❌ Failed to archive conversation:', response.error);
          resolve(false);
        }
      });
    });
  }

  /**
   * Mute or unmute conversation
   */
  muteConversation(conversationId: string, isMuted: boolean): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve(false);
        return;
      }

      this.socket.emit('muteConversation', { conversationId, isMuted }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          console.error('❌ Failed to mute conversation:', response.error);
          resolve(false);
        }
      });
    });
  }

  /**
   * Add message callback
   */
  onMessage(conversationId: string, callback: (message: Message) => void): () => void {
    if (!this.messageCallbacks.has(conversationId)) {
      this.messageCallbacks.set(conversationId, []);
    }
    this.messageCallbacks.get(conversationId)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.messageCallbacks.get(conversationId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Add conversation callback
   */
  onConversation(callback: (conversation: Conversation) => void): () => void {
    this.conversationCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.conversationCallbacks.indexOf(callback);
      if (index > -1) {
        this.conversationCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Add typing callback
   */
  onTyping(callback: (indicator: TypingIndicator) => void): () => void {
    this.typingCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.typingCallbacks.indexOf(callback);
      if (index > -1) {
        this.typingCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Add online users callback
   */
  onOnlineUsers(callback: (users: OnlineUsers) => void): () => void {
    this.onlineUsersCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.onlineUsersCallbacks.indexOf(callback);
      if (index > -1) {
        this.onlineUsersCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Add connection callback
   */
  onConnection(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify all message callbacks
   */
  private notifyMessageCallbacks(message: Message) {
    const callbacks = this.messageCallbacks.get(message.conversationId);
    if (callbacks) {
      callbacks.forEach(cb => cb(message));
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Disconnect chat service
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.userId = null;
    this.messageCallbacks.clear();
    this.conversationCallbacks = [];
    this.typingCallbacks = [];
    this.onlineUsersCallbacks = [];
    this.connectionCallbacks = [];
  }

  /**
   * Format message time
   */
  formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * Get message preview
   */
  getMessagePreview(message: Message): string {
    switch (message.type) {
      case 'text':
        return message.content.length > 50 ? message.content.substring(0, 50) + '...' : message.content;
      case 'image':
        return '📷 Photo';
      case 'file':
        return `📎 ${message.metadata?.fileName || 'File'}`;
      case 'system':
        return message.content;
      default:
        return 'Message';
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
