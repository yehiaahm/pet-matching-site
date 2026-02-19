/**
 * GPS Analytics Component
 * Displays location-based analytics from the real backend
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import { safeGet } from '../utils/safeFetch';
import { 
  BarChart3, 
  MapPin, 
  Users, 
  Heart, 
  TrendingUp,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsData {
  totalPets: number;
  verifiedPets: number;
  verificationRate: number;
  averageRating: number;
  averageDistance: number;
  nearbyMatches: number;
  successRate: number;
  lastUpdated: string;
}

interface GPSAnalyticsProps {
  open?: boolean;
  onClose?: () => void;
}

export function GPSAnalytics({ open = true, onClose }: GPSAnalyticsProps = {}) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Fetching GPS analytics from: /api/v1/analytics/overview');

      const response = await safeGet('/api/v1/analytics/overview');

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch analytics');
      }

      setAnalytics(response.data);
      console.log('✅ Analytics loaded successfully');

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(message);
      console.error('❌ Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const refreshAnalytics = () => {
    fetchAnalytics();
    toast.success('Analytics refreshed');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refreshAnalytics} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No analytics data available</p>
          </div>
        </div>
      </div>
    );
  }

  if (!open) {
    return null;
  }

  const content = (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            📊 GPS Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time insights from location-based matching
          </p>
        </div>
        <Button onClick={refreshAnalytics} variant="outline">
          <BarChart3 className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{analytics.totalPets}</div>
            <div className="text-sm text-gray-600">Total Pets</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{analytics.averageDistance.toFixed(1)} km</div>
            <div className="text-sm text-gray-600">Avg Distance</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Heart className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{analytics.nearbyMatches}</div>
            <div className="text-sm text-gray-600">Nearby Matches</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">{analytics.successRate}%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pet Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Pet Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Total Pets</div>
                <div className="text-xl font-semibold">{analytics.totalPets}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Verified Pets</div>
                <div className="text-xl font-semibold text-green-600">{analytics.verifiedPets}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Verification Rate</span>
                <Badge variant="outline" className="text-green-600">
                  {analytics.verificationRate}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Rating</span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="font-semibold">{analytics.averageRating}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-500" />
              Location Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Distance</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold">{analytics.averageDistance.toFixed(1)}</span>
                  <span className="text-sm text-gray-600">km</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Nearby Matches</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {analytics.nearbyMatches} pets
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Success Rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${analytics.successRate}%` }}
                    />
                  </div>
                  <span className="font-semibold">{analytics.successRate}%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>💡 Insight:</strong> Pets within 25km radius have {analytics.successRate}% higher match success rate
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
      </div>
    </div>
  );

  // Return as dialog if open prop is provided, otherwise return content directly
  if (open !== undefined) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return content;
}
