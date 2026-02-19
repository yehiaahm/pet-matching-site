import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Protected Route Component
 * يحمي الصفحات من الوصول غير المصرح به
 * 
 * @param children - المحتوى المراد حمايته
 * @param requireAuth - هل يتطلب تسجيل دخول (افتراضي: true)
 * @param redirectTo - الصفحة المراد التوجيه إليها إذا لم يكن المستخدم مسجل دخول
 */
export default function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // عرض شاشة التحميل أثناء التحقق من المصادقة
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">جاري التحقق من الهوية...</p>
        </div>
      </div>
    );
  }

  // إذا كانت الصفحة تتطلب تسجيل دخول والمستخدم غير مسجل
  if (requireAuth && !isAuthenticated) {
    // حفظ الموقع الحالي للتوجيه إليه بعد تسجيل الدخول
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // إذا كانت الصفحة لا تتطلب تسجيل دخول والمستخدم مسجل (مثل صفحة Login/Register)
  if (!requireAuth && isAuthenticated) {
    // التوجيه إلى لوحة التحكم إذا كان المستخدم مسجل بالفعل
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // عرض المحتوى المحمي
  return <>{children}</>;
}
