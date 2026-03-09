import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSellerAccess } from '../hooks/useSellerAccess';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface SellerOnlyRouteProps {
  children: ReactNode;
}

export default function SellerOnlyRoute({ children }: SellerOnlyRouteProps) {
  const { canAccessSellerDashboard, loadingSellerAccess } = useSellerAccess();

  if (loadingSellerAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!canAccessSellerDashboard) {
    return <Navigate to="/marketplace" replace />;
  }

  return <>{children}</>;
}
