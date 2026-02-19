import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function SystemSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    maintenanceMode: false,
    maintenanceMessage: '',
    enableUserRegistration: true,
    enableBreedingRequests: true,
    enableMessaging: true,
    maxWarningsBeforeBan: 3,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
        setFormData(data.settings);
      } else {
        toast.error(data.message || 'Failed to load settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      console.log('💾 Saving settings...');
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Data to save:', {
        maintenanceMode: formData.maintenanceMode,
        maintenanceMessage: formData.maintenanceMessage,
        enableUserRegistration: formData.enableUserRegistration,
        enableBreedingRequests: formData.enableBreedingRequests,
        enableMessaging: formData.enableMessaging,
        maxWarningsBeforeBan: parseInt(formData.maxWarningsBeforeBan),
      });

      const response = await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          maintenanceMode: formData.maintenanceMode,
          maintenanceMessage: formData.maintenanceMessage,
          enableUserRegistration: formData.enableUserRegistration,
          enableBreedingRequests: formData.enableBreedingRequests,
          enableMessaging: formData.enableMessaging,
          maxWarningsBeforeBan: parseInt(formData.maxWarningsBeforeBan),
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok && data.success) {
        toast.success('تم حفظ الإعدادات بنجاح! ✅');
        setSettings(data.settings);
        
        // Normalize the response data
        const normalizedSettings = {
          maintenanceMode: data.settings.maintenanceMode ?? false,
          maintenanceMessage: data.settings.maintenanceMessage ?? '',
          enableUserRegistration: data.settings.enableUserRegistration ?? true,
          enableBreedingRequests: data.settings.enableBreedingRequests ?? true,
          enableMessaging: data.settings.enableMessaging ?? true,
          maxWarningsBeforeBan: data.settings.maxWarningsBeforeBan ?? 3,
        };
        setFormData(normalizedSettings);
      } else {
        toast.error(data.message || data.error || 'فشل حفظ الإعدادات ❌');
        console.error('Save failed:', data);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('حدث خطأ أثناء حفظ الإعدادات ❌');
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = async () => {
    if (!window.confirm('Are you sure you want to clear all cache? This cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/admin/cache/clear', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success('تم مسح الـ Cache بنجاح! ✅');
      } else {
        toast.error(data.message || 'Failed to clear cache');
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('حدث خطأ أثناء مسح الـ Cache ❌');
    }
  };

  const handleDeleteOldReports = async () => {
    if (!window.confirm('Are you sure you want to delete reports older than 90 days? This cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/admin/reports/cleanup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`تم حذف ${data.deletedCount || 0} بلاغ قديم! ✅`);
      } else {
        toast.error(data.message || 'Failed to delete old reports');
      }
    } catch (error) {
      console.error('Error deleting old reports:', error);
      toast.error('حدث خطأ أثناء حذف البلاغات ❌');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Maintenance Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Maintenance Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenance" className="text-base font-medium">
                Enable Maintenance Mode
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Disable user access while performing maintenance
              </p>
            </div>
            <Switch
              id="maintenance"
              checked={formData.maintenanceMode}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, maintenanceMode: checked })
              }
            />
          </div>

          {formData.maintenanceMode && (
            <div>
              <Label htmlFor="message">Maintenance Message</Label>
              <Textarea
                id="message"
                placeholder="Enter message to show users during maintenance..."
                value={formData.maintenanceMessage || ''}
                onChange={(e) =>
                  setFormData({ ...formData, maintenanceMessage: e.target.value })
                }
                rows={4}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">
                Enable User Registration
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Allow new users to create accounts
              </p>
            </div>
            <Switch
              checked={formData.enableUserRegistration}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, enableUserRegistration: checked })
              }
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">
                  Enable Breeding Requests
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Allow users to create breeding requests
                </p>
              </div>
              <Switch
                checked={formData.enableBreedingRequests}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, enableBreedingRequests: checked })
                }
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">
                  Enable Messaging
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Allow users to send messages
                </p>
              </div>
              <Switch
                checked={formData.enableMessaging}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, enableMessaging: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Moderation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Moderation Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="warnings">Maximum Warnings Before Ban</Label>
            <div className="mt-2">
              <Input
                id="warnings"
                type="number"
                min="1"
                max="10"
                value={formData.maxWarningsBeforeBan || 3}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxWarningsBeforeBan: e.target.value,
                  })
                }
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Users will be automatically banned after reaching this number of warnings
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">Dangerous Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={handleClearCache}
            variant="outline" 
            className="w-full text-red-600 border-red-300 hover:bg-red-100"
          >
            Clear All Cache
          </Button>
          <Button 
            onClick={handleDeleteOldReports}
            variant="outline" 
            className="w-full text-red-600 border-red-300 hover:bg-red-100"
          >
            Delete Old Reports (&gt;90 days)
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </Button>
        <Button
          onClick={() => {
            setFormData(settings);
            toast.info('تم إلغاء التغييرات');
          }}
          variant="outline"
          className="flex-1"
          disabled={saving}
        >
          إلغاء
        </Button>
      </div>
    </div>
  );
}

export default SystemSettings;
