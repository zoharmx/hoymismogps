
import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import StatsGrid from './StatsGrid';
import VehicleFilters from './VehicleFilters';
import VehicleList from './VehicleList';

const Sidebar: React.FC = () => {
  const { sidebarOpen } = useAppStore();

  return (
    <aside 
      className={`
        w-[350px] bg-gradient-to-b from-dark-800 to-dark-900 border-r border-gray-700 
        mt-[70px] h-[calc(100vh-70px)] overflow-y-auto transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Dashboard HoyMismoGPS</h2>
        <StatsGrid />
      </div>

      {/* Vehicle Filters */}
      <div className="p-6 border-b border-gray-700">
        <VehicleFilters />
      </div>

      {/* Vehicle List */}
      <div className="p-6">
        <VehicleList />
      </div>
    </aside>
  );
};

export default Sidebar;
