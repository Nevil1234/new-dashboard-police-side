// hooks/use-geolocation.ts
import { useState, useEffect } from "react";

export function useGeolocation() {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if geolocation is supported by the browser
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    // Get the current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setCoordinates([longitude, latitude]); // Store as [longitude, latitude]
      },
      (err) => {
        setError(err.message); // Handle geolocation errors (e.g., permission denied)
        console.error("Geolocation error:", err);
      },
      {
        enableHighAccuracy: true, // Request high accuracy
        maximumAge: 10000, // Accept cached position up to 10 seconds old
        timeout: 5000, // Timeout after 5 seconds
      }
    );
  }, []); // Empty dependency array ensures it runs only once on mount

  return { coordinates, error };
}