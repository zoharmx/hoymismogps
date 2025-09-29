
import React from 'react';
import { useAppStore } from '../../store/useAppStore';

const VehicleFilters: React.FC = () => {
  const { filters, setFilters } = useAppStore();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ status: e.target.value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ vehicleType: e.target.value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-300 mb-2">Estado del Vehículo</label>
        <select
          value={filters.status}
          onChange={handleStatusChange}
          className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white text-sm focus:border-secondary focus:outline-none"
        >
          <option value="all">Todos los vehículos</option>
          <option value="active">En movimiento</option>
          <option value="inactive">Estacionados</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-2">Tipo de Vehículo</label>
        <select
          value={filters.vehicleType}
          onChange={handleTypeChange}
          className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white text-sm focus:border-secondary focus:outline-none"
        >
          <option value="all">Todos los tipos</option>
          <option value="truck">Camiones</option>
          <option value="car">Automóviles</option>
          <option value="motorcycle">Motocicletas</option>
          <option value="van">Furgonetas</option>
          <option value="bus">Autobuses</option>
        </select>
      </div>
    </div>
  );
};

export default VehicleFilters;
