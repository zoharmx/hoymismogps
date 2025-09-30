// src/components/Dashboard/Dashboard.tsx

import React, { useEffect, useState } from 'react';
// AJUSTE 1: La ruta a 'types' necesita subir un nivel si 'Dashboard.tsx' está en 'src/components/Dashboard/'
import type { Vehicle } from '../../types'; 
// AJUSTE 2: La ruta a 'MapContainer' también debe ajustarse
import MapContainer from '../Map/MapContainer';

// AJUSTE 3: Cambiar el nombre de la función de 'App' a 'Dashboard'
function Dashboard() { 
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        const response = await fetch(`${apiBaseUrl}/api/v1/vehicles`, {
          headers: {
            'X-API-Key': 'test_key_gps001'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        setVehicles(data.vehicles || []);
        setError(null);
      } catch (err) {
        // En Typescript es mejor manejar 'err' como 'unknown' o 'any'
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Error: ${errorMessage}`);
        console.error('Error fetching vehicles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
    const interval = setInterval(fetchVehicles, 10000);
    return () => clearInterval(interval);
  }, []);

  // ... (Todos los estilos que definiste permanecen exactamente igual)
  const appStyle: React.CSSProperties = { /*...*/ };
  const headerStyle: React.CSSProperties = { /*...*/ };
  const titleStyle: React.CSSProperties = { /*...*/ };
  const mainContentStyle: React.CSSProperties = { /*...*/ };
  const sidebarStyle: React.CSSProperties = { /*...*/ };
  const mapContainerStyle: React.CSSProperties = { /*...*/ };
  const cardStyle: React.CSSProperties = { /*...*/ };


  if (loading) {
    return (
      <div style={appStyle}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '18px', color: '#00FFFF' }}>
            Cargando datos GPS en tiempo real...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={appStyle}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '18px', color: '#FF6600', marginBottom: '10px' }}>
            {error}
          </div>
          <div style={{ fontSize: '14px', color: '#888' }}>
            Verificando conexión con backend...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={appStyle}>
      {/* Header */}
      <header style={headerStyle}>
        {/* ... Tu código del header sin cambios ... */}
      </header>

      {/* Main Content: Sidebar + Map */}
      <div style={mainContentStyle}>
        {/* Sidebar with vehicle list */}
        <div style={sidebarStyle}>
            {/* ... Tu código del sidebar sin cambios ... */}
        </div>

        {/* Map */}
        <div style={mapContainerStyle}>
          <MapContainer />
        </div>
      </div>
    </div>
  );
}

// AJUSTE 4: Exportar el componente 'Dashboard'
export default Dashboard;