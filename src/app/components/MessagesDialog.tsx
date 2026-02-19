import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Scroll, Send, Trash2, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import CommunitySupport from './CommunitySupport';
import { useLanguage } from '../context/LanguageContext';

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

interface MessagesDialogProps {
  open: boolean;
  onClose: () => void;
}

export function MessagesDialog({ open, onClose }: MessagesDialogProps) {
  const { language } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showCommunitySupport, setShowCommunitySupport] = useState(false);

  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

  useEffect(() => {
    if (open) {
      fetchConversations();
      fetchUnreadCount();
    }
  }, [open]);

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
      // Extract userId from conversationId (format: "user_xxxxx")
      const userId = conversationId.split('_')[1];
      const response = await fetch(`/api/v1/messages/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.data || []);
      setSelectedConversation(conversationId);
      
      // Mark messages as read
      data.data?.forEach((msg: Message) => {
        if (!msg.read && msg.senderId !== localStorage.getItem('userId')) {
          markMessageAsRead(msg.id);
        }
      });
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      toast.error('Failed to fetch messages');
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/v1/messages/${messageId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      const userId = selectedConversation.split('_')[1];
      const response = await fetch('/api/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: userId,
          content: messageText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setMessageText('');
      fetchMessages(selectedConversation);
      fetchConversations();
      toast.success('Message sent');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message';
      toast.error(message);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      const response = await fetch(`/api/v1/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      setMessages(messages.filter(m => m.id !== messageId));
      toast.success('Message deleted');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete message';
      toast.error(message);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUserFromCommunity = async (user: any) => {
    try {
      // Create a new conversation by sending the first message or just opening the chat
      const conversationId = `user_${user.id}`;
      setSelectedConversation(conversationId);
      
      // Try to fetch existing messages with this user
      try {
        await fetchMessages(conversationId);
      } catch (err) {
        // If no messages exist yet, just open an empty conversation
        setMessages([]);
        console.log('No existing messages with this user');
      }
      
      toast.success(language === 'ar' 
        ? `تم فتح محادثة مع ${user.firstName}` 
        : `Conversation opened with ${user.firstName}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error(language === 'ar' ? 'فشل فتح المحادثة' : 'Failed to open conversation');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scroll className="w-5 h-5" />
              {language === 'ar' ? 'الرسائل' : 'Messages'}
              {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
            </div>
            <Button
              size="sm"
              onClick={() => setShowCommunitySupport(true)}
              className="bg-blue-500 hover:bg-blue-600 gap-2"
            >
              <Plus className="w-4 h-4" />
              {language === 'ar' ? 'إضافة مستخدم' : 'Add User'}
            </Button>
          </DialogTitle>
          <DialogDescription>
            {language === 'ar' ? 'عرض وإدارة محادثاتك' : 'View and manage your conversations'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Conversations List */}
          <div className="w-64 border-r flex flex-col">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No conversations yet
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => fetchMessages(conv.id)}
                    className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
                      selectedConversation === conv.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {conv.participantName}
                        </p>
                        <p className="text-xs text-gray-600 truncate mt-1">
                          {conv.lastMessage}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <Badge variant="default" className="ml-2 text-xs">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(conv.lastMessageTime).toLocaleDateString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Messages View */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${
                          msg.senderId === localStorage.getItem('userId') ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg group relative ${
                            msg.senderId === localStorage.getItem('userId')
                              ? 'bg-blue-500 text-white'
                              : 'bg-white border text-gray-900'
                          }`}
                        >
                          <p className="text-sm break-words">{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.senderId === localStorage.getItem('userId')
                              ? 'text-blue-100'
                              : 'text-gray-500'
                          }`}>
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </p>
                          {msg.senderId === localStorage.getItem('userId') && (
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete message"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="border-t p-4 bg-white">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a conversation to view messages
              </div>
            )}
          </div>
        </div>
      </DialogContent>
      {/* Community Support Dialog */}
      <CommunitySupport
        open={showCommunitySupport}
        onClose={() => setShowCommunitySupport(false)}
        onSelectUser={handleSelectUserFromCommunity}
      />    </Dialog>
  );
}

export default MessagesDialog;
