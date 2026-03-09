import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  Check, 
  Upload,
  Camera,
  CheckCircle2,
  Star,
  Zap,
  ArrowRight,
  QrCode,
  Image as ImageIcon,
  FileText,
  Trash2
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  description?: string;
  recommended?: boolean;
}

interface PaymentSectionProps {
  selectedPlan: any;
  user?: {
    name?: string;
    email?: string;
  };
  onPaymentComplete?: (paymentData: any) => void;
}

const PAYMENT_REQUESTS_STORAGE_KEY = 'petmat_payment_requests';

const paymentMethods: PaymentMethod[] = [
  {
    id: 'instapay',
    name: 'Instapay',
    icon: Smartphone,
    color: 'text-emerald-600',
    description: 'الدفع الفوري في مصر',
    recommended: true
  }
];

const INSTAPAY_QR_CANDIDATES = [
  '/payments/instapay-qr.jpg',
  '/payments/instapay-qr.jpeg',
  '/payments/instapay-qr.png',
  '/payments/instapay-qr.webp',
];

export function ModernPaymentSection({ selectedPlan, user, onPaymentComplete }: PaymentSectionProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('instapay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [qrIndex, setQrIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (allowedTypes.includes(file.type)) {
        setUploadedFile(file);
      } else {
        alert('يرجى رفع صورة (JPG, PNG) أو ملف PDF فقط');
      }
    }
  };

  const handleInstapayConfirm = async () => {
    if (!uploadedFile) {
      alert('يرجى رفع صورة إثبات الدفع أولاً');
      return;
    }

    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const screenshotDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(new Error('Failed to read screenshot file'));
      reader.readAsDataURL(uploadedFile);
    });

    const paymentRequest = {
      id: `payment-${Date.now()}`,
      order_id: `Order-${Date.now()}`,
      customer_name: user?.name || 'مستخدم',
      customer_email: user?.email || 'user@example.com',
      amount: selectedPlan?.price || 19.99,
      payment_method: 'instapay',
      payment_status: 'pending_review',
      order_status: 'pending_payment',
      uploaded_screenshot: screenshotDataUrl,
      time: new Date().toISOString(),
      plan_name: selectedPlan?.name || 'Premium'
    };

    const existingRaw = localStorage.getItem(PAYMENT_REQUESTS_STORAGE_KEY);
    const existingRequests = existingRaw ? JSON.parse(existingRaw) : [];
    localStorage.setItem(
      PAYMENT_REQUESTS_STORAGE_KEY,
      JSON.stringify([paymentRequest, ...existingRequests])
    );
    
    setPaymentCompleted(true);
    setIsProcessing(false);
    
    if (onPaymentComplete) {
      onPaymentComplete(paymentRequest);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Methods Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">اختر طريقة الدفع</h3>
        <div className="grid grid-cols-1 gap-4">
          {paymentMethods.map((method) => (
            <motion.div
              key={method.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-200 border-2 ${
                  selectedMethod === method.id 
                    ? 'border-blue-500 bg-blue-50/30 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center ${method.color}`}>
                        <method.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{method.name}</h4>
                          {method.recommended && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs font-medium">
                              <Star className="w-3 h-3 mr-1" />
                              موصى به في مصر
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.recommended && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          سريع وآمن
                        </Badge>
                      )}
                      {selectedMethod === method.id && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Instapay Payment */}
        {selectedMethod === 'instapay' && (
          <motion.div
            key="instapay"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-lg border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-emerald-800">
                      <Smartphone className="w-6 h-6" />
                      الدفع عبر Instapay
                    </CardTitle>
                    <CardDescription className="text-emerald-600">
                      الدفع الفوري والآمن في مصر
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      <Star className="w-3 h-3 mr-1" />
                      موصى به
                    </Badge>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <Zap className="w-3 h-3 mr-1" />
                      سريع وآمن
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Instructions */}
                <div className="bg-white rounded-xl p-6 border border-emerald-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">معلومات التحويل</h4>
                      <p className="text-sm text-gray-600">استخدم هذه المعلومات لإتمام الدفع</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">اسم المستلم:</span>
                      <span className="font-semibold text-gray-900">Yehia Ahmed</span>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <p className="text-sm font-medium text-emerald-800 mb-2">
                        طريقة التحويل عبر Instapay:
                      </p>
                      <p className="text-sm text-emerald-700">
                        قم بالتحويل عبر Instapay إلى اسم المستخدم أو كود QR أدناه
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="bg-white rounded-xl p-6 border border-emerald-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">كود QR للدفع</h4>
                      <p className="text-sm text-gray-600">امسح الكود للتعبئة التلقائية</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-4">
                    {qrIndex < INSTAPAY_QR_CANDIDATES.length ? (
                      <img
                        src={INSTAPAY_QR_CANDIDATES[qrIndex]}
                        alt="Instapay QR"
                        className="w-60 h-60 rounded-xl border border-gray-200 object-contain bg-white p-2"
                        onError={() => setQrIndex((current) => current + 1)}
                      />
                    ) : (
                      <div className="w-48 h-48 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
                        <QrCode className="w-16 h-16 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 text-center">
                          لم يتم رفع صورة QR بعد<br/>
                          ضع الملف داخل public/payments<br/>
                          باسم instapay-qr.jpg
                        </p>
                      </div>
                    )}

                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        المستلم: Yehia Ahmed
                      </p>
                      <p className="text-sm text-gray-600">
                        المبلغ: ${selectedPlan?.price || 19.99}
                      </p>
                      <p className="text-xs text-gray-500">
                        Order ID: Order-{Date.now()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Steps */}
                <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-blue-600" />
                    خطوات الدفع
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                        1
                      </div>
                      <p className="text-sm text-gray-700">افتح تطبيق Instapay</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                        2
                      </div>
                      <p className="text-sm text-gray-700">امسح كود QR أو أرسل للمستلم</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                        3
                      </div>
                      <p className="text-sm text-gray-700">أرسل المبلغ المحدد بالضبط</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                        4
                      </div>
                      <p className="text-sm text-gray-700">ارفع صورة إثبات الدفع أدناه</p>
                    </div>
                  </div>
                </div>

                {/* Upload Section */}
                {!paymentCompleted && (
                  <div className="bg-white rounded-xl p-6 border border-emerald-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Upload className="w-5 h-5 text-emerald-600" />
                      رفع إثبات الدفع
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-emerald-300 rounded-xl p-6 text-center bg-emerald-50/50">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <div className="cursor-pointer flex flex-col items-center space-y-3">
                          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Camera className="w-8 h-8 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">ارفع صورة إثبات الدفع</p>
                            <p className="text-sm text-gray-600">JPG, PNG, PDF (الحد الأقصى: 5MB)</p>
                          </div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            اختر ملف
                          </Button>
                        </div>
                      </div>

                      {uploadedFile && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                              {uploadedFile.type.includes('image') ? (
                                <ImageIcon className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <FileText className="w-5 h-5 text-emerald-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                              <p className="text-sm text-gray-600">
                                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeUploadedFile}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {paymentCompleted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 rounded-xl p-6 border border-green-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-800">تم رفع إثبات الدفع بنجاح!</h4>
                        <p className="text-sm text-green-700 mt-1">
                          طلبك قيد المراجعة، وخلال 5 دقائق سيتم التحقق من عملية الدفع.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Confirm Button */}
                {!paymentCompleted && (
                  <Button
                    onClick={handleInstapayConfirm}
                    disabled={!uploadedFile || isProcessing}
                    size="lg"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium h-14 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        جاري المعالجة...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        لقد أكملت الدفع
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
