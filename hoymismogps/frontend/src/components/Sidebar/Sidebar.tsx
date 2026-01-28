
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import StatsGrid from './StatsGrid';
import VehicleFilters from './VehicleFilters';
import VehicleList from './VehicleList';

const Sidebar: React.FC = () => {
  const { sidebarOpen } = useAppStore();
  const location = useLocation();

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

        {/* Navigation */}
        <div className="flex gap-2 mb-6">
          <Link
            to="/"
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg transition-colors ${
              location.pathname === '/'
                ? 'bg-primary/20 text-primary border border-primary/50'
                : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
            }`}
          >
            <LayoutDashboard size={18} />
            <span className="font-medium text-sm">Monitor</span>
          </Link>

          <Link
            to="/reports"
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg transition-colors ${
              location.pathname === '/reports'
                ? 'bg-primary/20 text-primary border border-primary/50'
                : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
            }`}
          >
            <FileText size={18} />
            <span className="font-medium text-sm">Reportes</span>
          </Link>
        </div>

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
