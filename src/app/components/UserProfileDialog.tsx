import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { User, Shield, Phone, MapPin, Star, CheckCircle, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

export function UserProfileDialog({ open, onClose }: UserProfileDialogProps) {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [fullName, setFullName] = useState('Ahmed Mohamed Ali');
  const [phone, setPhone] = useState('01001234567');
  const [email, setEmail] = useState('ahmed@example.com');
  const [address, setAddress] = useState('Cairo - Maadi');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // التحقق من حجم الملف (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('الصورة كبيرة جداً. الحجم الأقصى 2MB');
        return;
      }

      // التحقق من نوع الملف
      if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
        toast.error('يرجى اختيار صورة JPG أو PNG');
        return;
      }

      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast.success('تم اختيار الصورة بنجاح');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    // التحقق من البيانات المطلوبة
    if (!fullName.trim()) {
      toast.error('الرجاء إدخال الاسم الكامل');
      return;
    }
    if (!phone.trim()) {
      toast.error('الرجاء إدخال رقم الهاتف');
      return;
    }
    if (!address.trim()) {
      toast.error('الرجاء إدخال العنوان');
      return;
    }

    setIsSaving(true);
    try {
      // هنا يمكن إضافة API call لحفظ البيانات
      // await fetch('/api/v1/users/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ fullName, phone, email, address, profileImage })
      // });

      // محاكاة حفظ البيانات
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('✅ تم حفظ التغييرات بنجاح!');
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">My Profile</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button variant="outline" size="sm" onClick={handleImageClick}>
                  <Upload className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
                <p className="text-sm text-gray-600 mt-2">JPG or PNG (Max size: 2MB)</p>
              </div>
            </div>

            <Separator />

            {/* Verification Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-full">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">Verified Account</h3>
                    <Badge className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Certified
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your identity has been successfully verified. You can now communicate with all users.
                  </p>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Your Rating</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-2xl font-bold">4.9</span>
                    </div>
                    <span className="text-sm text-gray-600">(12 reviews)</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">12</p>
                  <p className="text-sm text-gray-600">Successful Matches</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Personal Information */}
            <div>
              <h3 className="font-semibold mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input 
                    id="fullName" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="nationalId">National ID *</Label>
                  <div className="relative">
                    <Input id="nationalId" defaultValue="29101******01" disabled />
                    <Badge className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    National ID has been verified. Cannot be edited.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div>
              <h3 className="font-semibold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="phone" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10" 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="address" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-10" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Security */}
            <div>
              <h3 className="font-semibold mb-4">Security</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Settings
                </Button>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                🔒 <span className="font-medium">Your Privacy Matters:</span> Your personal information 
                will only be shared with relevant parties after you approve a breeding request.
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSaving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveChanges} 
            disabled={isSaving}
            className="flex-1 bg-gradient-to-r from-blue-500 to-green-500"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
