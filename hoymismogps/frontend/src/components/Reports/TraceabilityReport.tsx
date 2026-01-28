import React, { useState, useEffect, useRef, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { format, differenceInMinutes } from 'date-fns';
import { Calendar, Download, Search, MapPin, Navigation, Clock, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { apiService } from '../../services/api';
import { environment } from '../../config/environment';
import type { GPSLocation, Vehicle } from '../../types';

// Set Mapbox token
mapboxgl.accessToken = environment.MAPBOX_ACCESS_TOKEN;

// Helper to calculate distance between two coordinates in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

const TraceabilityReport: React.FC = () => {
  const { vehicles, setVehicles } = useAppStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // State
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [historyData, setHistoryData] = useState<GPSLocation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize defaults
  useEffect(() => {
    // Load vehicles if not present
    if (vehicles.length === 0) {
      apiService.getVehicles().then(setVehicles).catch(err => console.error('Error loading vehicles:', err));
    }

    // Set default dates (today)
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    // Format for datetime-local input: YYYY-MM-DDThh:mm
    const formatDateForInput = (date: Date) => {
      const pad = (n: number) => n < 10 ? '0' + n : n;
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    setStartDate(formatDateForInput(start));
    setEndDate(formatDateForInput(end));
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // Already initialized

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-117.1611, 32.7157], // Default San Diego
      zoom: 10,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add load event listener to ensure style is loaded before adding layers
    mapRef.current.on('load', () => {
       console.log('Map loaded');
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    if (historyData.length === 0) return null;

    let totalDistance = 0;
    let maxSpeed = 0;
    let totalSpeed = 0;

    for (let i = 0; i < historyData.length; i++) {
      const point = historyData[i];
      if (point.speed > maxSpeed) maxSpeed = point.speed;
      totalSpeed += point.speed;

      if (i > 0) {
        const prev = historyData[i - 1];
        totalDistance += calculateDistance(prev.latitude, prev.longitude, point.latitude, point.longitude);
      }
    }

    const avgSpeed = totalSpeed / historyData.length;
    const startTime = new Date(historyData[0].timestamp);
    const endTime = new Date(historyData[historyData.length - 1].timestamp);
    const durationMinutes = differenceInMinutes(endTime, startTime);

    return {
      totalDistance: totalDistance.toFixed(2),
      maxSpeed: maxSpeed.toFixed(1),
      avgSpeed: avgSpeed.toFixed(1),
      duration: durationMinutes,
      points: historyData.length
    };
  }, [historyData]);

  // Handle Generate Report
  const handleGenerate = async () => {
    if (!selectedVehicleId) {
      setError('Por favor seleccione un vehículo');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHistoryData([]);

    try {
      // Clean previous markers and routes
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      if (mapRef.current?.getLayer('route')) {
        mapRef.current.removeLayer('route');
      }
      if (mapRef.current?.getSource('route')) {
        mapRef.current.removeSource('route');
      }

      // Convert local input time to ISO string or whatever backend expects
      const startISO = new Date(startDate).toISOString();
      const endISO = new Date(endDate).toISOString();

      const data = await apiService.getVehicleHistory(selectedVehicleId, startISO, endISO);

      if (data.length === 0) {
        setError('No se encontraron datos para el periodo seleccionado');
        setIsLoading(false);
        return;
      }

      // Sort data by timestamp just in case
      const sortedData = data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      setHistoryData(sortedData);

      // Draw on Map
      if (mapRef.current) {
        const coordinates = sortedData.map(p => [p.longitude, p.latitude]);

        // Add Route Line
        mapRef.current.addSource('route', {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
              'type': 'LineString',
              'coordinates': coordinates
            }
          }
        });

        mapRef.current.addLayer({
          'id': 'route',
          'type': 'line',
          'source': 'route',
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': '#00FFFF',
            'line-width': 4
          }
        });

        // Add Start Marker
        const startEl = document.createElement('div');
        startEl.className = 'marker-start';
        startEl.innerHTML = '<div style="background-color: #00FF00; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white;"></div>';
        const startMarker = new mapboxgl.Marker(startEl)
          .setLngLat(coordinates[0] as [number, number])
          .setPopup(new mapboxgl.Popup().setText('Inicio: ' + format(new Date(sortedData[0].timestamp), 'dd/MM/yyyy HH:mm')))
          .addTo(mapRef.current);
        markersRef.current.push(startMarker);

        // Add End Marker
        const endEl = document.createElement('div');
        endEl.className = 'marker-end';
        endEl.innerHTML = '<div style="background-color: #FF0000; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white;"></div>';
        const endMarker = new mapboxgl.Marker(endEl)
          .setLngLat(coordinates[coordinates.length - 1] as [number, number])
          .setPopup(new mapboxgl.Popup().setText('Fin: ' + format(new Date(sortedData[sortedData.length - 1].timestamp), 'dd/MM/yyyy HH:mm')))
          .addTo(mapRef.current);
        markersRef.current.push(endMarker);

        // Fit bounds
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach(coord => bounds.extend(coord as [number, number]));
        mapRef.current.fitBounds(bounds, { padding: 50 });
      }

    } catch (err: any) {
      console.error('Error generating report:', err);
      setError(err.message || 'Error al generar el reporte');
    } finally {
      setIsLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (historyData.length === 0) return;

    const headers = ['Fecha/Hora,Latitud,Longitud,Velocidad(km/h),Rumbo'];
    const rows = historyData.map(p => {
      const date = format(new Date(p.timestamp), 'yyyy-MM-dd HH:mm:ss');
      return `${date},${p.latitude},${p.longitude},${p.speed},${p.heading}`;
    });

    const csvContent = headers.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_recorrido_${selectedVehicleId}_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-dark-900 text-white overflow-hidden p-6 gap-6">
      <div className="flex flex-col md:flex-row gap-6 h-full">

        {/* Left Panel: Controls & List */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">

          {/* Controls Card */}
          <div className="bg-dark-800 p-6 rounded-xl border border-gray-700 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
              <Search className="w-5 h-5" />
              Generar Reporte
            </h2>

            <div className="space-y-4">
              {/* Vehicle Select */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Vehículo</label>
                <select
                  className="w-full bg-dark-900 border border-gray-600 rounded-lg p-3 text-white focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                >
                  <option value="">Seleccione un vehículo...</option>
                  {vehicles.map(v => (
                    <option key={v.deviceId} value={v.deviceId}>
                      {v.name} ({v.deviceId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Inicio</label>
                <input
                  type="datetime-local"
                  className="w-full bg-dark-900 border border-gray-600 rounded-lg p-3 text-white focus:border-secondary outline-none"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Fin</label>
                <input
                  type="datetime-local"
                  className="w-full bg-dark-900 border border-gray-600 rounded-lg p-3 text-white focus:border-secondary outline-none"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {/* Buttons */}
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-secondary text-dark-900 font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dark-900"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Generar Reporte
                  </>
                )}
              </button>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Summary */}
          {stats && (
            <div className="bg-dark-800 p-6 rounded-xl border border-gray-700 shadow-xl animate-fade-in">
              <h3 className="text-lg font-bold mb-4 text-white">Resumen del Recorrido</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-dark-900 rounded-lg">
                  <div className="text-gray-400 text-xs mb-1">Distancia Total</div>
                  <div className="text-xl font-bold text-primary">{stats.totalDistance} km</div>
                </div>
                <div className="p-3 bg-dark-900 rounded-lg">
                  <div className="text-gray-400 text-xs mb-1">Velocidad Máx</div>
                  <div className="text-xl font-bold text-orange-400">{stats.maxSpeed} km/h</div>
                </div>
                <div className="p-3 bg-dark-900 rounded-lg">
                  <div className="text-gray-400 text-xs mb-1">Velocidad Prom</div>
                  <div className="text-xl font-bold text-blue-400">{stats.avgSpeed} km/h</div>
                </div>
                <div className="p-3 bg-dark-900 rounded-lg">
                  <div className="text-gray-400 text-xs mb-1">Duración</div>
                  <div className="text-xl font-bold text-green-400">{stats.duration} min</div>
                </div>
              </div>

              <button
                onClick={handleExportCSV}
                className="w-full mt-4 bg-dark-700 border border-gray-600 text-white py-2 px-4 rounded-lg hover:bg-dark-600 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
            </div>
          )}

        </div>

        {/* Right Panel: Map & Table */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">

          {/* Map */}
          <div className="flex-1 bg-dark-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden relative min-h-[400px]">
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>

          {/* Data Table */}
          {historyData.length > 0 && (
            <div className="h-1/3 bg-dark-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-700 bg-dark-800/50 backdrop-blur sticky top-0">
                <h3 className="font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Registro Detallado ({historyData.length} puntos)
                </h3>
              </div>
              <div className="overflow-auto flex-1">
                <table className="w-full text-left text-sm">
                  <thead className="bg-dark-900 text-gray-400 sticky top-0">
                    <tr>
                      <th className="p-3">Fecha / Hora</th>
                      <th className="p-3">Latitud</th>
                      <th className="p-3">Longitud</th>
                      <th className="p-3">Velocidad</th>
                      <th className="p-3">Rumbo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {historyData.map((point, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 font-mono text-gray-300">
                          {format(new Date(point.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                        </td>
                        <td className="p-3 font-mono text-blue-300">{point.latitude.toFixed(5)}</td>
                        <td className="p-3 font-mono text-blue-300">{point.longitude.toFixed(5)}</td>
                        <td className="p-3 font-mono text-orange-300">
                          {Math.round(point.speed)} km/h
                        </td>
                        <td className="p-3 text-gray-400">{point.heading}°</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default TraceabilityReport;
