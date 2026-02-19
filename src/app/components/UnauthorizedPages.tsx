/**
 * Unauthorized Access Pages
 * Pages for redirecting users when they don't have access to protected routes
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRoleBasedAccess } from '../../hooks/useRoleBasedAccess';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Lock, 
  AlertTriangle, 
  Shield, 
  Star, 
  Crown, 
  Home, 
  ArrowLeft,
  Settings,
  User,
  CreditCard
} from 'lucide-react';

// =============================================================================
// UNAUTHORIZED PAGE
// =============================================================================

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { roleInfo } = useRoleBasedAccess();

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleLogin = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
      <div className="max-w-md w-full">
        <Card className="border-red-200 bg-red-50 shadow-lg">
          <div className="p-8 text-center">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-red-600" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-red-900 mb-2">
              Access Denied
            </h1>

            {/* Description */}
            <p className="text-red-700 mb-6">
              You don't have permission to access this page.
              {user && roleInfo.role && (
                <>
                  <br />
                  Your current role: <span className="font-semibold">{roleInfo.displayName}</span>
                </>
              )}
            </p>

            {/* User Info */}
            {user && (
              <div className="bg-red-100 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-2xl">{roleInfo.icon}</span>
                  <span className="font-semibold text-red-900">{roleInfo.displayName}</span>
                </div>
                <p className="text-sm text-red-700">
                  {user.email}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                <Button
                  onClick={handleGoHome}
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </div>
              
              {!user && (
                <Button
                  onClick={handleLogin}
                  variant="outline"
                  className="w-full"
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>

            {/* Help Text */}
            <p className="text-xs text-red-600 mt-4">
              If you believe this is an error, please contact support.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// =============================================================================
// PREMIUM REQUIRED PAGE
// =============================================================================

export function PremiumRequiredPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { roleInfo } = useRoleBasedAccess();

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleUpgrade = () => {
    navigate('/upgrade');
  };

  const handleLogin = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-yellow-50 p-4">
      <div className="max-w-md w-full">
        <Card className="border-amber-200 bg-amber-50 shadow-lg">
          <div className="p-8 text-center">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
              <Star className="w-8 h-8 text-amber-600" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-amber-900 mb-2">
              Premium Feature
            </h1>

            {/* Description */}
            <p className="text-amber-700 mb-6">
              This feature requires a premium subscription.
              {user && roleInfo.role && (
                <>
                  <br />
                  Your current plan: <span className="font-semibold">{roleInfo.displayName}</span>
                </>
              )}
            </p>

            {/* Premium Benefits */}
            <div className="bg-amber-100 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-amber-900 mb-3 flex items-center justify-center">
                <Crown className="w-4 h-4 mr-2" />
                Premium Benefits
              </h3>
              <ul className="text-sm text-amber-700 space-y-2 text-left">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Unlimited pet listings</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Advanced AI matching</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Priority customer support</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Data export and analytics</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Custom themes and features</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Large file uploads</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                <Button
                  onClick={handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </div>
              
              <Button
                onClick={handleUpgrade}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
              
              {!user && (
                <Button
                  onClick={handleLogin}
                  variant="outline"
                  className="w-full"
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>

            {/* Help Text */}
            <p className="text-xs text-amber-600 mt-4">
              Upgrade to premium to unlock this feature and more!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// =============================================================================
// ADMIN REQUIRED PAGE
// =============================================================================

export function AdminRequiredPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { roleInfo } = useRoleBasedAccess();

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleLogin = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4">
      <div className="max-w-md w-full">
        <Card className="border-purple-200 bg-purple-50 shadow-lg">
          <div className="p-8 text-center">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-purple-900 mb-2">
              Administrator Access Required
            </h1>

            {/* Description */}
            <p className="text-purple-700 mb-6">
              This page is only accessible to system administrators.
              {user && roleInfo.role && (
                <>
                  <br />
                  Your current role: <span className="font-semibold">{roleInfo.displayName}</span>
                </>
              )}
            </p>

            {/* Warning */}
            <Alert className="mb-6 border-purple-200 bg-purple-100">
              <AlertTriangle className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-800">
                <div className="text-center">
                  <p className="font-semibold">Security Notice</p>
                  <p className="text-sm">
                    Unauthorized access attempts are logged and monitored.
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                <Button
                  onClick={handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </div>
              
              {!user && (
                <Button
                  onClick={handleLogin}
                  variant="outline"
                  className="w-full"
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>

            {/* Help Text */}
            <p className="text-xs text-purple-600 mt-4">
              If you need administrator access, please contact your system administrator.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// =============================================================================
// NOT FOUND PAGE (404)
// =============================================================================

export function NotFoundPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGoHome = () => {
    navigate(isAuthenticated ? '/dashboard' : '/');
  };

  const handleSearch = () => {
    // Navigate to search or help page
    navigate(isAuthenticated ? '/dashboard' : '/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4">
      <div className="max-w-md w-full">
        <Card className="border-gray-200 bg-gray-50 shadow-lg">
          <div className="p-8 text-center">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-gray-600" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Page Not Found
            </h1>

            {/* Description */}
            <p className="text-gray-700 mb-6">
              The page you're looking for doesn't exist or has been moved.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  onClick={handleGoHome}
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  {isAuthenticated ? 'Dashboard' : 'Home'}
                </Button>
                <Button
                  onClick={handleSearch}
                  variant="outline"
                  className="flex-1"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-600 mt-4">
              Please check the URL or contact support if you need assistance.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// =============================================================================
// ACCESS DENIED COMPONENT (for inline use)
// =============================================================================

interface AccessDeniedProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  backAction?: () => void;
  homeAction?: () => void;
  className?: string;
}

export function AccessDenied({
  title = 'Access Denied',
  message = 'You don\'t have permission to access this resource.',
  showBackButton = true,
  showHomeButton = true,
  backAction,
  homeAction,
  className = ''
}: AccessDeniedProps) {
  const defaultBackAction = () => window.history.back();
  const defaultHomeAction = () => window.location.href = '/dashboard';

  return (
    <div className={`text-center space-y-4 ${className}`}>
      <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
        <Lock className="w-6 h-6 text-red-600" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-red-900">{title}</h3>
        <p className="text-sm text-red-700">{message}</p>
      </div>

      {(showBackButton || showHomeButton) && (
        <div className="flex gap-2 justify-center">
          {showBackButton && (
            <button
              onClick={backAction || defaultBackAction}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Go Back
            </button>
          )}
          {showHomeButton && (
            <button
              onClick={homeAction || defaultHomeAction}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Dashboard
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// PREMIUM REQUIRED COMPONENT (for inline use)
// =============================================================================

interface PremiumRequiredProps {
  title?: string;
  message?: string;
  showUpgradeButton?: boolean;
  upgradeAction?: () => void;
  className?: string;
}

export function PremiumRequired({
  title = 'Premium Feature',
  message = 'This feature requires a premium subscription.',
  showUpgradeButton = true,
  upgradeAction,
  className = ''
}: PremiumRequiredProps) {
  const defaultUpgradeAction = () => window.location.href = '/upgrade';

  return (
    <div className={`text-center space-y-4 ${className}`}>
      <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
        <Star className="w-6 h-6 text-amber-600" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-amber-900">{title}</h3>
        <p className="text-sm text-amber-700">{message}</p>
      </div>

      {showUpgradeButton && (
        <button
          onClick={upgradeAction || defaultUpgradeAction}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm flex items-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          Upgrade to Premium
        </button>
      )}
    </div>
  );
}

// =============================================================================
// ADMIN REQUIRED COMPONENT (for inline use)
// =============================================================================

interface AdminRequiredProps {
  title?: string;
  message?: string;
  className?: string;
}

export function AdminRequired({
  title = 'Administrator Access Required',
  message = 'This page is only accessible to system administrators.',
  className = ''
}: AdminRequiredProps) {
  return (
    <div className={`text-center space-y-4 ${className}`}>
      <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
        <Shield className="w-6 h-6 text-purple-600" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-purple-900">{title}</h3>
        <p className="text-sm text-purple-700">{message}</p>
      </div>

      <div className="bg-purple-100 rounded-lg p-3">
        <p className="text-xs text-purple-800 text-center">
          <AlertTriangle className="inline w-3 h-3 mr-1" />
          Unauthorized access attempts are logged and monitored.
        </p>
      </div>
    </div>
  );
}
