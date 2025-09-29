
import React, { useMemo } from 'react';
import { Truck, Car, Bike, MapPin, Zap, Clock } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { Vehicle } from '../../types';

const VehicleList: React.FC = () => {
  const { vehicles, selectedVehicle, setSelectedVehicle, filters } = useAppStore();

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'truck': return <Truck className="w-4 h-4" />;
      case 'car': return <Car className="w-4 h-4" />;
      case 'motorcycle': return <Bike className="w-4 h-4" />;
      default: return <Car className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-400 shadow-green-400/50';
      case 'inactive': return 'bg-yellow-400 shadow-yellow-400/50';
      case 'offline': return 'bg-red-400 shadow-red-400/50';
      case 'maintenance': return 'bg-blue-400 shadow-blue-400/50';
      default: return 'bg-gray-400 shadow-gray-400/50';
    }
  };

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return 'Sin datos';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Actualizado: 1s';
    if (diffMinutes < 60) return `Actualizado: ${diffMinutes}min`;
    if (diffMinutes < 1440) return `Actualizado: ${Math.floor(diffMinutes / 60)}h`;
    return 'Hace más de 1 día';
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const statusMatch = filters.status === 'all' || vehicle.status === filters.status;
      const typeMatch = filters.vehicleType === 'all' || vehicle.vehicleType === filters.vehicleType;
      return statusMatch && typeMatch;
    });
  }, [vehicles, filters]);

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  return (
    <div className="space-y-3">
      {filteredVehicles.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <Car className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No hay vehículos que coincidan con los filtros</p>
        </div>
      ) : (
        filteredVehicles.map((vehicle) => (
          <div
            key={vehicle.deviceId}
            onClick={() => handleVehicleClick(vehicle)}
            className={`
              relative bg-white/5 border border-gray-600 rounded-xl p-4 cursor-pointer 
              transition-all duration-300 hover:bg-secondary/10 hover:border-secondary 
              hover:translate-x-1
              ${selectedVehicle?.deviceId === vehicle.deviceId 
                ? 'bg-green-400/10 border-green-400' 
                : ''
              }
            `}
          >
            {/* Status indicator */}
            <div className={`
              absolute top-4 right-4 w-3 h-3 rounded-full
              ${getStatusColor(vehicle.status)}
            `} />

            {/* Vehicle info */}
            <div className="pr-6">
              <div className="flex items-center gap-2 mb-1">
                {getVehicleIcon(vehicle.vehicleType)}
                <span className="font-semibold text-white">
                  {vehicle.deviceId} "{vehicle.name}"
                </span>
              </div>
              
              <div className="text-xs text-gray-400 font-mono space-y-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {vehicle.lastKnownLocation?.latitude 
                      ? `${vehicle.lastKnownLocation.latitude.toFixed(4)}°, ${vehicle.lastKnownLocation.longitude.toFixed(4)}°`
                      : 'Ubicación desconocida'
                    }
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span className={`${vehicle.status === 'active' ? 'text-primary' : 'text-orange-400'}`}>
                      {vehicle.lastKnownLocation?.speed 
                        ? `${Math.round(vehicle.lastKnownLocation.speed)} km/h`
                        : '0 km/h'
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatLastSeen(vehicle.lastSeen)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default VehicleList;
