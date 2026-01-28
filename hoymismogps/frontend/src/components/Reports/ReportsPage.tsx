import React from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import TraceabilityReport from './TraceabilityReport';

const ReportsPage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-dark-900 text-white overflow-hidden">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden mt-[70px]">
        {/* Sidebar */}
        <Sidebar />

        {/* Content */}
        <main className="flex-1 relative overflow-hidden flex flex-col">
          <TraceabilityReport />
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;
