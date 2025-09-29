
import React from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import MapContainer from '../Map/MapContainer';
import InfoPanel from '../VehicleInfo/InfoPanel';
import Notifications from './Notifications';
import { useRealTimeData } from '../../hooks/useRealTimeData';

const Dashboard: React.FC = () => {
  useRealTimeData(); // Initialize real-time data polling

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 relative">
          <MapContainer />
          <InfoPanel />
        </main>
      </div>

      <Notifications />
    </div>
  );
};

export default Dashboard;
