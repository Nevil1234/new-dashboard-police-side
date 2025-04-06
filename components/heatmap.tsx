"use client";

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoiYWRpdG5ldiIsImEiOiJjbTh6b3V1eHgwY3RxMndyeXFqcGdlY2ltIn0.4ENtBsKbc-zR9PpHB-CGug';

export default function Heatmap() {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [72.9713, 22.5334],
      zoom: 12
    });

    fetch('https://papi-22ld.onrender.com/locations')
      .then(res => res.json())
      .then(data => {
        const geojson = {
          type: 'FeatureCollection',
          features: data.map((location) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [location.lng, location.lat]
            }
          }))
        };

        map.on('load', () => {
          map.addSource('locations', {
            type: 'geojson',
            data: geojson
          });

          map.addLayer({
            id: 'heatmap-layer',
            type: 'heatmap',
            source: 'locations',
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
        });
      });

    return () => map.remove();
  }, []);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '600px' }} />;
}