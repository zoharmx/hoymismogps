
import React from 'react';
import { Search, Settings, User, Moon } from 'lucide-react';

const Header: React.FC = () => {

  return (
    <header className="fixed top-0 left-0 right-0 h-[70px] bg-gradient-to-r from-dark-800 to-dark-700 border-b border-gray-700 flex items-center px-6 z-50 backdrop-blur-lg">
      {/* Logo */}
      <div className="flex items-center gap-3 mr-10">
        <img 
          src="https://assets.zyrosite.com/m6Lj5RMGlLT19eqJ/bfa13bcc-519c-4519-b1d3-ef1d4ed8d2bd-YBgjplnEr2uMkkG6.png"
          alt="HoyMismoGPS Logo"
          className="h-11 w-auto filter brightness-110 saturate-120 rounded-lg shadow-lg shadow-primary/20 transition-all duration-300 hover:brightness-130 hover:saturate-140 hover:scale-105"
        />
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          HoyMismoGPS
        </span>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar vehículo, conductor o ubicación..."
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-gray-600 rounded-full text-white text-sm outline-none transition-all duration-300 focus:border-secondary focus:shadow-lg focus:shadow-secondary/30"
          />
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex gap-4 ml-auto">
        <button 
          className="px-4 py-2 bg-secondary/20 border border-secondary rounded-lg text-primary cursor-pointer transition-all duration-300 hover:bg-secondary/40 hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Moon className="w-4 h-4" />
          Tema
        </button>
        <button 
          className="px-4 py-2 bg-secondary/20 border border-secondary rounded-lg text-primary cursor-pointer transition-all duration-300 hover:bg-secondary/40 hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Configuración
        </button>
        <button 
          className="px-4 py-2 bg-secondary/20 border border-secondary rounded-lg text-primary cursor-pointer transition-all duration-300 hover:bg-secondary/40 hover:-translate-y-0.5 flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          Usuario
        </button>
      </div>
    </header>
  );
};

export default Header;
