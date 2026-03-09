import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VerificationBadgeComponent from '../components/VerificationBadge';
import InstantAlerts from '../components/InstantAlerts';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function FeaturesShowcasePage() {
  const { user, token } = useAuth();
  const apiBase = import.meta.env.VITE_API_BASE || '/api/v1';
  const navigate = useNavigate();

  const quickFeatures = [
    {
      key: 'ai',
      title: 'AI Matching',
      desc: 'مطابقة ذكية للحيوانات الأليفة باستخدام الذكاء الاصطناعي.',
      path: '/ai',
    },
    {
      key: 'gps',
      title: 'GPS Proximity',
      desc: 'تطابق جغرافي حسب الموقع والمسافة القريبة.',
      path: '/gps-proximity',
    },
    {
      key: 'community',
      title: 'Community Support',
      desc: 'الدعم المجتمعي والتواصل مع باقي المستخدمين.',
      path: '/community-support',
    },
    {
      key: 'clinics',
      title: 'Vet Clinics Booking',
      desc: 'حجز العيادات البيطرية وإدارة الزيارات.',
      path: '/vet-clinics',
    },
    {
      key: 'health',
      title: 'Health Records',
      desc: 'سجل صحي كامل للحيوان الأليف والتطعيمات.',
      path: '/health-records',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ميزات الذكاء الاصطناعي 🤖</h1>
          <p className="text-lg text-gray-600">نظام المطابقة الذكية والتنبيهات الفورية</p>
        </div>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-slate-900">المميزات الأساسية الشغالة الآن</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickFeatures.map((feature) => (
                <div key={feature.key} className="rounded-xl border border-slate-200 p-4 bg-white">
                  <h3 className="text-base font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 mb-4">{feature.desc}</p>
                  <Button className="w-full" onClick={() => navigate(feature.path)}>
                    فتح الميزة
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* تنبيهات فورية */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-blue-50 border-b border-blue-200">
            <CardTitle className="text-blue-900">التنبيهات الفورية 🔔</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {user ? (
              <InstantAlerts userId={user.id} apiBase={apiBase} />
            ) : (
              <p className="text-gray-500">يرجى تسجيل الدخول</p>
            )}
          </CardContent>
        </Card>

        {/* الشارات والتحقق */}
        <Card className="border-purple-200 shadow-lg">
          <CardHeader className="bg-purple-50 border-b border-purple-200">
            <CardTitle className="text-purple-900">شارة التحقق ✨</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {user ? (
              <VerificationBadgeComponent userId={user.id} token={token || ''} />
            ) : (
              <p className="text-gray-500">يرجى تسجيل الدخول</p>
            )}
          </CardContent>
        </Card>

        {/* معلومات المستخدم */}
        {user && (
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-200">
              <CardTitle className="text-green-900">المستخدم الحالي 👤</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">الاسم:</span> {user.firstName} {user.lastName}</p>
                <p><span className="font-semibold">البريد:</span> {user.email}</p>
                <p><span className="font-semibold">الدور:</span> {user.role}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* معلومات الخدمات */}
        <Card className="border-yellow-200 shadow-lg">
          <CardHeader className="bg-yellow-50 border-b border-yellow-200">
            <CardTitle className="text-yellow-900">الخدمات المتاحة 🚀</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <p className="font-semibold">التوصيات الذكية</p>
                <p className="text-gray-600">استخدام الذكاء الاصطناعي لتحديد أفضل المطابقات</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <p className="font-semibold">الجدولة الذكية</p>
                <p className="text-gray-600">حساب أفضل فترات التزاوج تلقائياً</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <p className="font-semibold">التنبيهات الفورية</p>
                <p className="text-gray-600">إخطارات فورية عبر Socket.io</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <p className="font-semibold">شارات التحقق</p>
                <p className="text-gray-600">نظام الشارات بناءً على معدل النجاح</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <p className="font-semibold">العقود الذكية</p>
                <p className="text-gray-600">Solidity contracts على Blockchain</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* الخطوات التالية */}
        <Card className="border-orange-200 shadow-lg bg-orange-50">
          <CardHeader className="border-b border-orange-200">
            <CardTitle className="text-orange-900">الخطوات التالية 📋</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-2 text-sm">
            <ol className="list-decimal list-inside space-y-1">
              <li>تأكد من تشغيل خدمة AI: <code className="bg-orange-100 px-2 py-1 rounded">cd ai-service && uvicorn main:app --port 8001</code></li>
              <li>تأكد من تثبيت dependencies: <code className="bg-orange-100 px-2 py-1 rounded">npm install socket.io node-cron</code></li>
              <li>أعد تشغيل الخادم: <code className="bg-orange-100 px-2 py-1 rounded">npm start</code></li>
              <li>قم بتسجيل الدخول وانظر للتنبيهات الفورية</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
