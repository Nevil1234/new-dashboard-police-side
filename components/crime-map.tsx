"use client"

import { useEffect, useRef, useState } from "react";
import { MapPin, AlertTriangle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@/components/ui/button";
import { Card } from "./ui/card";

// Initialize Mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Incident {
  id: string;
  crime_type: string;
  created_at: string;
  location: string;
  coordinates?: { lng: number; lat: number } | null;
}

export default function CrimeMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Improved WKT parser with SRID support
  const parseLocation = (wkt: string) => {
    // Try SRID format first
    let matches = wkt.match(/SRID=\d+;POINT\((-?\d+\.?\d*) (-?\d+\.?\d*)\)/);
    if (matches) return { lng: +matches[1], lat: +matches[2] };
    
    // Fall back to regular POINT format
    matches = wkt.match(/POINT\((-?\d+\.?\d*) (-?\d+\.?\d*)\)/);
    return matches ? { lng: +matches[1], lat: +matches[2] } : null;
  };

  // Helper function for crime marker colors
  const getMarkerColor = (crimeType: string) => {
    switch (crimeType.toLowerCase()) {
      case 'theft': return '#FF0000'; // Red
      case 'assault': return '#8B00FF'; // Purple
      default: return '#FFFF00'; // Yellow
    }
  };

  const fetchIncidents = async () => {
    try {
      if (!navigator.geolocation) throw new Error("Geolocation not supported");
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { 
          enableHighAccuracy: true,
          timeout: 1000000
        });
      });

      const userCoords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      setUserLocation(userCoords);

      const { data, error: supaError } = await supabase.rpc('nearby_reports', {
        lat: userCoords.lat,
        lng: userCoords.lng,
        radius: 100000000
      });

      if (supaError) throw supaError;
      if (!data) throw new Error("No data returned");

      const validIncidents = data
        .map(incident => ({
          ...incident,
          coordinates: parseLocation(incident.location)
        }))
        .filter(incident => incident.coordinates);

      setIncidents(validIncidents);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize map when user location is available
  const initializeMap = () => {
    if (!mapContainerRef.current || !userLocation) return;
    
    try {
      // Clean up previous map if it exists
      if (mapRef.current) {
        mapRef.current.remove();
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
      }
      
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [userLocation.lng, userLocation.lat],
        zoom: 13
      });

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add user location marker
      const userMarker = new mapboxgl.Marker({ color: "#007BFF" })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map);
      
      markersRef.current.push(userMarker);

      // Add incident markers once map is loaded
      map.on("load", () => {
        incidents.forEach(incident => {
          if (!incident.coordinates) return;

          const marker = new mapboxgl.Marker({
            color: getMarkerColor(incident.crime_type)
          })
          .setLngLat([incident.coordinates.lng, incident.coordinates.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <strong>${incident.crime_type}</strong><br/>
              Reported ${formatTime(incident.created_at)}
            `)
          )
          .addTo(map);
          
          markersRef.current.push(marker);
        });
      });

      mapRef.current = map;
    } catch (mapError) {
      console.error("Map initialization error:", mapError);
      setError("Failed to load map. Please try again.");
    }
  };

  // Format relative time for incidents
  const formatTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / 3600000);
    return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
  };

  // Fetch incidents on component mount
  useEffect(() => {
    fetchIncidents();
    
    return () => {
      // Clean up map and markers on unmount
      if (mapRef.current) mapRef.current.remove();
      markersRef.current.forEach(marker => marker.remove());
    };
  }, []);

  // Initialize or update map when user location or incidents change
  useEffect(() => {
    if (userLocation) {
      initializeMap();
    }
  }, [userLocation, incidents]);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center p-4">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
      <Card className="relative w-full h-[600px] bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-50">
            <div className="text-center p-4">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-500">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={fetchIncidents}
              >
                Retry
              </Button>
            </div>
          </div>
        )}
  
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-40">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}
        
        <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
  
        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-background/80 dark:bg-gray-900/80 p-4 rounded-lg shadow-lg z-30">
          <h3 className="text-sm font-semibold mb-2">Incident Types</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-red-500 rounded-full mr-2" />
              <span className="text-sm">Theft</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 bg-purple-500 rounded-full mr-2" />
              <span className="text-sm">Assault</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 bg-yellow-500 rounded-full mr-2" />
              <span className="text-sm">Other Incidents</span>
            </div>
          </div>
        </div>
  
        {/* Geolocation Button */}
        <div className="absolute top-4 right-4 z-30">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchIncidents}
            className="shadow-sm bg-background"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
  
        {!isLoading && incidents.length === 0 && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-20">
            <div className="text-center p-4">
              <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No incidents reported in your area</p>
            </div>
          </div>
        )}
      </Card>
    )
  }