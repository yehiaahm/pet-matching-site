import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom Hook for Authentication
 * يوفر وصول سهل لبيانات المصادقة والدوال المتعلقة بها
 * 
 * @returns {AuthContextType} - كائن يحتوي على بيانات المستخدم ودوال المصادقة
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 * 
 *   if (!isAuthenticated) {
 *     return <div>يرجى تسجيل الدخول</div>;
 *   }
 * 
 *   return <div>مرحباً {user.firstName}</div>;
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
