import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Search, Users, Mail, Star, Shield, MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  rating?: number;
  isVerified: boolean;
}

interface CommunitySupportDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
}

export function CommunitySupport({ open, onClose, onSelectUser }: CommunitySupportDialogProps) {
  const { language } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      const response = await fetch(`/api/v1/messages/users/search?query=${encodeURIComponent(query)}&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error(language === 'ar' ? 'فشل البحث عن المستخدمين' : 'Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user: User) => {
    onSelectUser(user);
    onClose();
    toast.success(language === 'ar' ? `تم البدء في محادثة مع ${user.firstName}` : `Started conversation with ${user.firstName}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {language === 'ar' ? 'دعم المجتمع' : 'Community Support'}
          </DialogTitle>
          <DialogDescription>
            {language === 'ar'
              ? 'ابحث عن المربيين ذوي الخبرة واتصل بهم للحصول على نصائح متخصصة'
              : 'Search for experienced breeders and connect with them for expert advice'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={language === 'ar' ? 'ابحث عن المستخدمين...' : 'Search users...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="pl-10"
            />
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              </div>
            ) : users.length === 0 && hasSearched ? (
              <div className="text-center py-8 text-gray-500">
                {language === 'ar' ? 'لم يتم العثور على مستخدمين' : 'No users found'}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {language === 'ar'
                  ? 'ابدأ البحث للعثور على مربيين'
                  : 'Start searching to find breeders'
                }
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center text-white font-semibold">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-600 truncate">{user.email}</p>
                          {user.isVerified && (
                            <Shield className="w-3 h-3 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-2">
                    {user.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-semibold text-gray-700">
                          {user.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleSelectUser(user)}
                      className="bg-blue-500 hover:bg-blue-600 gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {language === 'ar' ? 'تواصل' : 'Contact'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CommunitySupport;
