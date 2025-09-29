
import React from 'react';
import { useAppStore } from '../../store/useAppStore';

const StatsGrid: React.FC = () => {
  const { stats } = useAppStore();

  const statCards = [
    {
      value: stats.activeVehicles,
      label: 'Vehículos Activos',
      color: 'text-primary'
    },
    {
      value: `${stats.connectivity}%`,
      label: 'Conectividad', 
      color: 'text-green-400'
    },
    {
      value: stats.alerts,
      label: 'Alertas',
      color: 'text-orange-400'
    },
    {
      value: stats.totalDistance,
      label: 'Recorrido Hoy',
      color: 'text-blue-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-secondary/10 p-4 rounded-xl border border-secondary/20">
          <div className={`text-xl font-bold font-mono mb-1 ${stat.color}`}>
            {stat.value}
          </div>
          <div className="text-xs text-gray-400">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
