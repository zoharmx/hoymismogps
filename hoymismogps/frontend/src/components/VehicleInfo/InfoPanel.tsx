
import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { MapPin, Gauge, Compass, Signal, Mountain, Battery } from 'lucide-react';

const InfoPanel: React.FC = () => {
  const { selectedVehicle } = useAppStore();

  if (!selectedVehicle || !selectedVehicle.lastKnownLocation) {
    return (
      <div className="fixed bottom-5 left-[370px] right-5 bg-dark-800/95 border border-gray-600 rounded-2xl p-6 backdrop-blur-lg z-40">
        <div className="text-center text-gray-400">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Selecciona un vehículo para ver información detallada</p>
        </div>
      </div>
    );
  }

  const location = selectedVehicle.lastKnownLocation;
  const getDirectionText = (heading: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  };

  const infoItems = [
    {
      icon: <MapPin className="w-4 h-4" />,
      label: 'Latitud',
      value: `${location.latitude.toFixed(6)}°`,
      color: 'text-primary'
    },
    {
      icon: <MapPin className="w-4 h-4" />,
      label: 'Longitud', 
      value: `${location.longitude.toFixed(6)}°`,
      color: 'text-primary'
    },
    {
      icon: <Mountain className="w-4 h-4" />,
      label: 'Altitud',
      value: location.altitude ? `${Math.round(location.altitude)}m` : 'N/A',
      color: 'text-blue-400'
    },
    {
      icon: <Gauge className="w-4 h-4" />,
      label: 'Velocidad',
      value: `${Math.round(location.speed)} km/h`,
      color: selectedVehicle.status === 'active' ? 'text-green-400' : 'text-gray-400'
    },
    {
      icon: <Compass className="w-4 h-4" />,
      label: 'Dirección',
      value: `${Math.round(location.heading)}° (${getDirectionText(location.heading)})`,
      color: 'text-yellow-400'
    },
    {
      icon: <Signal className="w-4 h-4" />,
      label: 'Señal GPS',
      value: location.gpsSignalStrength ? `${location.gpsSignalStrength}%` : 'N/A',
      color: (location.gpsSignalStrength || 0) > 70 ? 'text-green-400' : 
             (location.gpsSignalStrength || 0) > 40 ? 'text-yellow-400' : 'text-red-400'
    }
  ];

  return (
    <div className="fixed bottom-5 left-[370px] right-5 bg-dark-800/95 border border-gray-600 rounded-2xl p-6 backdrop-blur-lg z-40 shadow-2xl">
      {/* Vehicle Header */}
      <div className="mb-6 pb-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-1">
          {selectedVehicle.name}
        </h3>
        <p className="text-sm text-gray-400">
          {selectedVehicle.deviceId} • {selectedVehicle.vehicleType}
        </p>
        
        {/* Status Badge */}
        <div className="mt-2">
          <span className={`
            inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
            ${selectedVehicle.status === 'active' 
              ? 'bg-green-400/20 text-green-400 border border-green-400/30' 
              : selectedVehicle.status === 'inactive'
              ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
              : 'bg-red-400/20 text-red-400 border border-red-400/30'
            }
          `}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              selectedVehicle.status === 'active' ? 'bg-green-400' :
              selectedVehicle.status === 'inactive' ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
            {selectedVehicle.status === 'active' ? 'En línea' :
             selectedVehicle.status === 'inactive' ? 'Inactivo' : 'Desconectado'}
          </span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {infoItems.map((item, index) => (
          <div key={index} className="text-center">
            <div className="flex justify-center mb-2">
              <div className={`p-2 rounded-lg bg-white/5 ${item.color}`}>
                {item.icon}
              </div>
            </div>
            <div className={`text-lg font-semibold font-mono mb-1 ${item.color}`}>
              {item.value}
            </div>
            <div className="text-xs text-gray-400">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoPanel;
