
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAppStore } from '../../store/useAppStore';
import type { Vehicle } from '../../types';
import MapControls from './MapControls';

import { environment } from '../../config/environment';

// Mapbox access token
mapboxgl.accessToken = environment.MAPBOX_ACCESS_TOKEN;

const MapContainer: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  
  const { vehicles, selectedVehicle, mapViewport, setMapViewport } = useAppStore();
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [mapViewport.longitude, mapViewport.latitude],
      zoom: mapViewport.zoom,
      antialias: true,
    });

    mapRef.current.on('load', () => {
      setMapLoaded(true);
    });

    mapRef.current.on('move', () => {
      if (mapRef.current) {
        const center = mapRef.current.getCenter();
        const zoom = mapRef.current.getZoom();
        setMapViewport({
          latitude: center.lat,
          longitude: center.lng,
          zoom: zoom,
        });
      }
    });

    // Add navigation control
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapRef.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  // Create vehicle marker
  const createVehicleMarker = (vehicle: Vehicle) => {
    if (!vehicle.lastKnownLocation) return null;

    const el = document.createElement('div');
    el.className = 'vehicle-marker';
    
    const isActive = vehicle.status === 'active';
    const color = isActive ? '#00FFFF' : '#FF6600';
    const size = isActive ? '24px' : '20px';
    
    el.innerHTML = `
      <div style="
        background: ${color}; 
        width: ${size}; 
        height: ${size}; 
        border-radius: 50%; 
        border: 3px solid #0066FF; 
        box-shadow: 0 0 20px ${color}80;
        ${isActive ? 'animation: pulse 2s infinite;' : 'opacity: 0.8;'}
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
        color: #000;
      ">
        ${vehicle.vehicleType === 'truck' ? '🚛' : 
          vehicle.vehicleType === 'car' ? '🚗' : 
          vehicle.vehicleType === 'motorcycle' ? '🏍️' : '🚐'}
      </div>
    `;

    const marker = new mapboxgl.Marker(el)
      .setLngLat([
        vehicle.lastKnownLocation.longitude,
        vehicle.lastKnownLocation.latitude
      ]);

    // Add popup
    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: true,
      closeOnClick: false,
    }).setHTML(`
      <div class="p-3 text-white bg-dark-800 rounded-lg">
        <div class="font-bold text-primary mb-2">${vehicle.name}</div>
        <div class="text-sm space-y-1">
          <div><strong>ID:</strong> ${vehicle.deviceId}</div>
          <div><strong>Velocidad:</strong> ${Math.round(vehicle.lastKnownLocation?.speed || 0)} km/h</div>
          <div><strong>Estado:</strong> ${vehicle.status === 'active' ? 'En línea' : 'Desconectado'}</div>
          <div><strong>Coordenadas:</strong> ${vehicle.lastKnownLocation.latitude.toFixed(4)}°, ${vehicle.lastKnownLocation.longitude.toFixed(4)}°</div>
        </div>
      </div>
    `);

    marker.setPopup(popup);

    // Click handler
    el.addEventListener('click', () => {
      popup.addTo(mapRef.current!);
    });

    return marker;
  };

  // Update markers when vehicles change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Add new markers
    vehicles.forEach(vehicle => {
      if (vehicle.lastKnownLocation) {
        const marker = createVehicleMarker(vehicle);
        if (marker) {
          marker.addTo(mapRef.current!);
          markersRef.current.set(vehicle.deviceId, marker);
        }
      }
    });
  }, [vehicles, mapLoaded]);

  // Fly to selected vehicle
  useEffect(() => {
    if (!mapRef.current || !selectedVehicle?.lastKnownLocation) return;

    mapRef.current.flyTo({
      center: [
        selectedVehicle.lastKnownLocation.longitude,
        selectedVehicle.lastKnownLocation.latitude
      ],
      zoom: 16,
      duration: 2000,
      essential: true,
    });

    // Show popup for selected vehicle
    const marker = markersRef.current.get(selectedVehicle.deviceId);
    if (marker) {
      marker.getPopup()?.addTo(mapRef.current);
    }
  }, [selectedVehicle]);

  return (
    <div className="relative flex-1 mt-[70px]">
      <div
        ref={mapContainerRef}
        className="w-full h-full bg-dark-900"
      />
      <MapControls />
    </div>
  );
};

export default MapContainer;
