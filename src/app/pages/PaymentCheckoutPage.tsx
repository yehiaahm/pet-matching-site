import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ModernPaymentSection } from '../components/ModernPaymentSection';

type PlanId = 'professional' | 'elite';

const PLANS: Record<PlanId, { id: PlanId; name: string; price: number }> = {
  professional: {
    id: 'professional',
    name: 'Professional Plan',
    price: 9.99,
  },
  elite: {
    id: 'elite',
    name: 'Elite Breeder Plan',
    price: 29.99,
  },
};

export default function PaymentCheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  const selectedPlan = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const requestedPlan = (params.get('plan') || 'professional').toLowerCase();
    if (requestedPlan === 'elite') {
      return PLANS.elite;
    }
    return PLANS.professional;
  }, [location.search]);

  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        name: parsed?.firstName || parsed?.email || 'User',
        email: parsed?.email || 'user@example.com',
      };
    } catch {
      return {
        name: 'User',
        email: 'user@example.com',
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">صفحة الدفع</h1>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Selected Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-gray-900">{selectedPlan.name}</p>
            <p className="text-gray-600">${selectedPlan.price}/month</p>
          </CardContent>
        </Card>

        {paymentSubmitted && (
          <Card className="border-green-300 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">شكرا لك!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-green-700">
                تم استلام طلب الدفع بنجاح، وسيتم مراجعته في أقرب وقت.
              </p>
              <p className="text-green-700">
                شكرا لثقتك في منصة PetMat.
              </p>
              <Button onClick={() => navigate('/dashboard')}>الرجوع إلى لوحة التحكم</Button>
            </CardContent>
          </Card>
        )}

        <ModernPaymentSection
          selectedPlan={selectedPlan}
          user={currentUser}
          onPaymentComplete={() => {
            setPaymentSubmitted(true);
            toast.success('شكرا لك! تم استلام الدفع وإرساله للمراجعة');
          }}
        />
      </div>
    </div>
  );
}
