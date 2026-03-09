import { useEffect, useState } from 'react';
import { marketplaceService } from '../services/marketplaceService';

export function useSellerAccess() {
  const [canAccessSellerDashboard, setCanAccessSellerDashboard] = useState(false);
  const [loadingSellerAccess, setLoadingSellerAccess] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkSellerAccess = async () => {
      try {
        const response = await marketplaceService.mySellerAccount();
        if (isMounted) {
          setCanAccessSellerDashboard(Boolean(response?.seller?.id));
        }
      } catch {
        if (isMounted) {
          setCanAccessSellerDashboard(false);
        }
      } finally {
        if (isMounted) {
          setLoadingSellerAccess(false);
        }
      }
    };

    void checkSellerAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  return { canAccessSellerDashboard, loadingSellerAccess };
}
