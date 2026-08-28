import { useState, useEffect } from "react";

export interface GeolocationState {
  loading: boolean;
  denied: boolean;
  coords: { lat: number; lng: number } | null;
  error: string | null;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    loading: true,
    denied: false,
    coords: null,
    error: null,
  });

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setState({
        loading: false,
        denied: false,
        coords: null,
        error: "Geolocation is not supported by this browser.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          loading: false,
          denied: false,
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          error: null,
        });
      },
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED;
        setState({
          loading: false,
          denied,
          coords: null,
          error: err.message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  return state;
}
