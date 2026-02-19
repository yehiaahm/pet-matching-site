import { useState } from 'react';
import { Pet } from '../App';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { AlertCircle, Calendar, FileText, Heart, Shield, CheckCircle } from 'lucide-react';

interface MatchRequestDialogProps {
  pet: Pet;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function MatchRequestDialog({ pet, open, onClose, onSubmit }: MatchRequestDialogProps) {
  const [myPetId, setMyPetId] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [duration, setDuration] = useState('3-5');
  const [notes, setNotes] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToContract, setAgreeToContract] = useState(false);
  const [agreeToVerification, setAgreeToVerification] = useState(false);

  const canSubmit = myPetId && preferredDate && agreeToTerms && agreeToContract && agreeToVerification;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">طلب تزاوج مع {pet.name}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Pet Info Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border rounded-lg p-4">
              <div className="flex gap-4">
                <img
                  src={pet.images?.[0] || pet.image || ''}
                  alt={pet.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{pet.name}</h3>
                  <p className="text-sm text-gray-600">{pet.breed} • {pet.age} سنة • {pet.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-600">المالك:</span>
                    <span className="font-medium">{pet.owner.name}</span>
                    {pet.owner.verified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* My Pet Selection */}
            <div>
              <h3 className="font-semibold mb-4">اختيار حيوانك الأليف</h3>
              <div>
                <Label htmlFor="myPet">حيواني الأليف *</Label>
                <Select value={myPetId} onValueChange={setMyPetId}>
                  <SelectTrigger id="myPet">
                    <SelectValue placeholder="اختر حيوانك الأليف للتزاوج" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="demo-pet-1">لونا - قط فارسي - سنتان - أنثى</SelectItem>
                    <SelectItem value="demo-pet-2">بيلا - golde retriever - 3 سنوات - أنثى</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  سيتم التحقق من توافق السلالات والتطعيمات تلقائياً
                </p>
              </div>
            </div>

            <Separator />

            {/* Schedule */}
            <div>
              <h3 className="font-semibold mb-4">جدول التزاوج</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferredDate">التاريخ المفضل *</Label>
                    <Input
                      id="preferredDate"
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">مدة الإقامة (أيام) *</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger id="duration">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2">1-2 يوم</SelectItem>
                        <SelectItem value="3-5">3-5 أيام (موصى به)</SelectItem>
                        <SelectItem value="6-7">6-7 أيام</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    💡 <span className="font-medium">نصيحة:</span> فترة 3-5 أيام موصى بها لزيادة 
                    فرص نجاح التزاوج.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Notes */}
            <div>
              <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي معلومات إضافية ترغب في مشاركتها مع المالك..."
                rows={3}
              />
            </div>

            <Separator />

            {/* Digital Contract Preview */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">العقد الرقمي</h3>
              </div>
              <div className="bg-gray-50 border rounded-lg p-4 space-y-2 text-sm">
                <p className="font-medium">شروط العقد:</p>
                <ul className="space-y-1 list-disc list-inside text-gray-700">
                  <li>يوافق الطرف الأول على تسليم الحيوان في التاريخ المحدد</li>
                  <li>يوافق الطرف الثاني على إعادة الحيوان في التاريخ المتفق عليه</li>
                  <li>كل طرف مسؤول عن رعاية الحيوان أثناء وجوده في عهدته</li>
                  <li>في حالة الحمل، سيتم الاتفاق على توزيع الذرية</li>
                  <li>أي ضرر أو مشاكل صحية ستكون مسؤولية الطرف المخطئ</li>
                  <li>يمكن لأي طرف إلغاء الطلب قبل 48 ساعة من التاريخ المحدد</li>
                </ul>
                <Button variant="outline" size="sm" className="mt-3">
                  <FileText className="w-4 h-4 mr-2" />
                  عرض العقد الكامل
                </Button>
              </div>
            </div>

            <Separator />

            {/* Security & Verification */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold">التحقق والأمان</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <Checkbox
                    id="verification"
                    checked={agreeToVerification}
                    onCheckedChange={(checked) => setAgreeToVerification(checked as boolean)}
                  />
                  <div className="flex-1">
                    <label htmlFor="verification" className="text-sm font-medium cursor-pointer">
                      أوافق على التحقق من الهوية *
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      سيتم طلب منك تقديم نسخة من بطاقة الرقم القومي أو جواز السفر للتحقق
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Checkbox
                    id="contract"
                    checked={agreeToContract}
                    onCheckedChange={(checked) => setAgreeToContract(checked as boolean)}
                  />
                  <div className="flex-1">
                    <label htmlFor="contract" className="text-sm font-medium cursor-pointer">
                      أوافق على توقيع العقد الرقمي *
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      العقد الرقمي له قوة قانونية ويمكن الرجوع إليه في حالة النزاع
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  />
                  <div className="flex-1">
                    <label htmlFor="terms" className="text-sm font-medium cursor-pointer">
                      أوافق على الشروط والأحكام *
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      لقد قرأت وفهمت جميع الشروط والأحكام المتعلقة بخدمة التزاوج
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-yellow-900">تنبيه قانوني مهم:</p>
                  <ul className="space-y-1 text-yellow-800 list-disc list-inside">
                    <li>هذا الطلب له قوة قانونية بموجب القانون المصري</li>
                    <li>أي انتهاك للعقد قد يؤدي إلى إجراء قانوني</li>
                    <li>عدم إعادة الحيوان يعتبر سرقة</li>
                    <li>جميع التفاصيل سيتم تسجيلها في النظام للمرجعية</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            إلغاء
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="flex-1 bg-gradient-to-r from-blue-500 to-green-500"
          >
            <Heart className="w-4 h-4 mr-2" />
            إرسال الطلب
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
