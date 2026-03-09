import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

type VerificationState = 'loading' | 'success' | 'error';

interface SubscriptionPaymentResultPageProps {
  mode: 'success' | 'cancel';
}

export default function SubscriptionPaymentResultPage({ mode }: SubscriptionPaymentResultPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<VerificationState>(mode === 'cancel' ? 'error' : 'loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (mode === 'cancel') {
      setMessage('تم إلغاء عملية الدفع. لم يتم تفعيل أي اشتراك.');
      return;
    }

    const verify = async () => {
      const orderId = searchParams.get('order_id');
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('authToken');

      if (!orderId) {
        setState('error');
        setMessage('رقم الطلب غير موجود.');
        return;
      }

      if (!token) {
        setState('error');
        setMessage('جلسة تسجيل الدخول غير متاحة. الرجاء تسجيل الدخول مرة أخرى.');
        return;
      }

      try {
        const response = await fetch('/api/v1/subscription/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderId }),
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          const errorMessage = payload?.message || payload?.error || 'فشل تأكيد الاشتراك';
          throw new Error(errorMessage);
        }

        setState('success');
        setMessage('تم تفعيل اشتراكك بنجاح.');
        toast.success('تم تفعيل الاشتراك بنجاح');

        setTimeout(() => {
          navigate('/dashboard');
        }, 1800);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'فشل تأكيد الاشتراك';
        setState('error');
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    verify();
  }, [mode, navigate, searchParams]);

  const isLoading = state === 'loading';
  const isSuccess = state === 'success';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {isLoading ? 'جاري تأكيد الدفع...' : isSuccess ? 'تم التفعيل بنجاح' : 'تعذر إكمال العملية'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            {isLoading ? (
              <Loader2 className="h-14 w-14 animate-spin text-primary" />
            ) : isSuccess ? (
              <CheckCircle className="h-14 w-14 text-green-600" />
            ) : (
              <XCircle className="h-14 w-14 text-red-600" />
            )}
          </div>

          <p className="text-center text-muted-foreground">{message}</p>

          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => navigate('/dashboard')}>الذهاب إلى لوحة التحكم</Button>
            {!isLoading && (
              <Button variant="outline" onClick={() => navigate('/')}>الصفحة الرئيسية</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
