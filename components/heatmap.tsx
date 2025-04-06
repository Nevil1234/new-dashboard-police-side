"use client";

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiYWRpdG5ldiIsImEiOiJjbTh6b3V1eHgwY3RxMndyeXFqcGdlY2ltIn0.4ENtBsKbc-zR9PpHB-CGug';

interface CrimeLocation {
  lat: number;
  lng: number;
  type: string;
}

export default function Heatmap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [72.9713, 22.5334],
      zoom: 12
    });

    mapRef.current = map;

    fetch('/api/locations')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data: CrimeLocation[]) => {
        const geojson = {
          type: 'FeatureCollection' as const,
          features: data.map(location => ({
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: [location.lng, location.lat] as [number, number]
            },
            properties: {
              type: location.type
            }
          }))
        };

        map.on('load', () => {
          map.addSource('crime-locations', {
            type: 'geojson',
            data: geojson
          });

          map.addLayer({
            id: 'heatmap-layer',
            type: 'heatmap',
            source: 'crime-locations',
            maxzoom: 15,
            paint: {
              'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(0, 0, 255, 0)',
                0.2, 'blue',
                0.4, 'lime',
                0.6, 'yellow',
                0.8, 'orange',
                1, 'red'
              ],
              'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 15, 20],
              'heatmap-opacity': 0.8
            }
          });

          setLoading(false);
        });
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 z-10">
          Loading heatmap...
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100/50 z-10">
          Error: {error}
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}