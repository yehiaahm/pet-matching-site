import React, { useState, useEffect } from 'react';
import { Shield, Zap, Bell } from 'lucide-react';
import { Badge } from './ui/badge';

interface VerificationBadgeProps {
  userId: string;
  token: string;
}

const VerificationBadgeComponent: React.FC<VerificationBadgeProps> = ({ userId, token }) => {
  const [badge, setBadge] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadge();
  }, [userId]);

  const fetchBadge = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || '/api/v1'}/verification/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBadge(data.data);
      }
    } catch (err) {
      console.error('Badge fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-sm text-muted-foreground">جاري التحميل...</div>;
  if (!badge) return null;

  const badgeColors: Record<string, string> = {
    'Platinum': 'bg-slate-500 text-white',
    'Gold': 'bg-yellow-500 text-white',
    'Silver': 'bg-gray-400 text-white',
    'Bronze': 'bg-orange-600 text-white',
    'Unverified': 'bg-gray-300 text-gray-700',
  };

  const badgeIcon: Record<string, JSX.Element> = {
    'Platinum': <Shield className="w-4 h-4 mr-1" />,
    'Gold': <Shield className="w-4 h-4 mr-1" />,
    'Silver': <Shield className="w-4 h-4 mr-1" />,
    'Bronze': <Shield className="w-4 h-4 mr-1" />,
    'Unverified': <Zap className="w-4 h-4 mr-1" />,
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Badge className={`${badgeColors[badge.badge] || 'bg-gray-300'} flex items-center`}>
          {badgeIcon[badge.badge]}
          {badge.badge}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {badge.badge !== 'Unverified' ? 'موثق ✓' : 'غير موثق'}
        </span>
      </div>

      {badge.metrics && (
        <div className="text-xs space-y-1 bg-muted p-2 rounded">
          <div>معدل النجاح: {(badge.metrics.successRate * 100).toFixed(1)}%</div>
          <div>التقييم: {badge.metrics.rating.toFixed(1)}/5</div>
          <div>نسبة الشكاوى: {(badge.metrics.complaintsRate * 100).toFixed(1)}%</div>
        </div>
      )}
    </div>
  );
};

export default VerificationBadgeComponent;
