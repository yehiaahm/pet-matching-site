/**
 * useGeolocation Hook
 * Handles GPS location tracking with permission management
 */

import { useState, useEffect, useCallback } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface UseGeolocationReturn {
  location: Location | null;
  loading: boolean;
  error: string | null;
  permission: 'granted' | 'denied' | 'prompt' | null;
  requestLocation: () => Promise<void>;
  watchLocation: () => void;
  stopWatching: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt' | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Check initial permission status
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermission(result.state as 'granted' | 'denied' | 'prompt');
      });
    }
  }, []);

  // Handle successful location update
  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const newLocation: Location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };
    
    setLocation(newLocation);
    setError(null);
    setLoading(false);
    
    console.log('📍 Location updated:', {
      lat: newLocation.latitude,
      lng: newLocation.longitude,
      accuracy: newLocation.accuracy
    });
  }, []);

  // Handle location error
  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Unknown error occurred';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location permission denied. Please enable location access.';
        setPermission('denied');
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out.';
        break;
      default:
        errorMessage = `Location error: ${error.message}`;
    }
    
    setError(errorMessage);
    setLoading(false);
    console.error('❌ Geolocation error:', errorMessage);
  }, []);

  // Request location once
  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      });

      handleSuccess(position);
    } catch (err) {
      handleError(err as GeolocationPositionError);
    }
  }, [handleSuccess, handleError]);

  // Watch location continuously
  const watchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    if (watchId !== null) {
      // Already watching
      return;
    }

    const id = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minute
      }
    );

    setWatchId(id);
    console.log('📍 Started watching location');
  }, [handleSuccess, handleError, watchId]);

  // Stop watching location
  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      console.log('📍 Stopped watching location');
    }
  }, [watchId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    location,
    loading,
    error,
    permission,
    requestLocation,
    watchLocation,
    stopWatching,
  };
}
