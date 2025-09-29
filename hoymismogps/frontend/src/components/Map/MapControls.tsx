
import React, { useState } from 'react';
import { MapPin, Maximize, Layers, Navigation } from 'lucide-react';

const MapControls: React.FC = () => {
  const [showLayerSelector, setShowLayerSelector] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState('streets');

  const layers = [
    { id: 'streets', name: '🗺️ Calles', style: 'mapbox://styles/mapbox/dark-v11' },
    { id: 'satellite', name: '🛰️ Satélite', style: 'mapbox://styles/mapbox/satellite-v9' },
    { id: 'terrain', name: '🏔️ Terreno', style: 'mapbox://styles/mapbox/outdoors-v12' },
    { id: 'traffic', name: '🚦 Tráfico', style: 'mapbox://styles/mapbox/navigation-day-v1' },
  ];

  const handleLayerChange = (layerId: string, style: string) => {
    setSelectedLayer(layerId);
    // TODO: Implement map style change
    setShowLayerSelector(false);
  };

  const handleCenterLocation = () => {
    // TODO: Implement center to user location
    console.log('Center to location');
  };

  const handleFullscreen = () => {
    // TODO: Implement fullscreen toggle
    console.log('Toggle fullscreen');
  };

  return (
    <div className="absolute top-5 right-5 flex flex-col gap-3 z-10">
      {/* Individual Controls */}
      <button
        onClick={handleCenterLocation}
        className="bg-dark-800/95 border border-gray-600 rounded-xl p-3 backdrop-blur-lg cursor-pointer transition-all duration-300 hover:bg-secondary/20 hover:border-secondary group"
        title="Centrar en mi ubicación"
      >
        <MapPin className="w-5 h-5 text-gray-300 group-hover:text-primary" />
      </button>

      <button
        onClick={handleFullscreen}
        className="bg-dark-800/95 border border-gray-600 rounded-xl p-3 backdrop-blur-lg cursor-pointer transition-all duration-300 hover:bg-secondary/20 hover:border-secondary group"
        title="Pantalla completa"
      >
        <Maximize className="w-5 h-5 text-gray-300 group-hover:text-primary" />
      </button>

      {/* Layer Selector */}
      <div className="relative">
        <button
          onClick={() => setShowLayerSelector(!showLayerSelector)}
          className="bg-dark-800/95 border border-gray-600 rounded-xl p-3 backdrop-blur-lg cursor-pointer transition-all duration-300 hover:bg-secondary/20 hover:border-secondary group"
          title="Capas del mapa"
        >
          <Layers className="w-5 h-5 text-gray-300 group-hover:text-primary" />
        </button>

        {showLayerSelector && (
          <div className="absolute right-0 top-full mt-2 bg-dark-800/95 border border-gray-600 rounded-xl p-4 backdrop-blur-lg min-w-[200px] shadow-xl">
            {layers.map((layer) => (
              <label
                key={layer.id}
                className="flex items-center mb-3 last:mb-0 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="layer"
                  value={layer.id}
                  checked={selectedLayer === layer.id}
                  onChange={() => handleLayerChange(layer.id, layer.style)}
                  className="mr-3 accent-primary"
                />
                <span className="text-sm text-gray-300 group-hover:text-white">
                  {layer.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapControls;
