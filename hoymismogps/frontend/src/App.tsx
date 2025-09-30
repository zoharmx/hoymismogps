import React, { useEffect, useState } from 'react';
import type { Vehicle } from './types';
import MapContainer from './components/Map/MapContainer';

function App() {
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
        setError(`Error: ${err}`);
        console.error('Error fetching vehicles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
    const interval = setInterval(fetchVehicles, 10000);
    return () => clearInterval(interval);
  }, []);

  const appStyle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    background: '#0a0a0a',
    color: '#ffffff',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    padding: '20px',
    border: '1px solid #333',
    borderBottom: '2px solid #00FFFF',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: '700',
    background: 'linear-gradient(45deg, #00FFFF, #0066FF)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const mainContentStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '400px 1fr',
    gap: '0',
    flex: 1,
    overflow: 'hidden',
  };

  const sidebarStyle: React.CSSProperties = {
    background: '#0f0f0f',
    borderRight: '1px solid #333',
    overflowY: 'auto',
    padding: '20px',
  };

  const mapContainerStyle: React.CSSProperties = {
    position: 'relative',
    height: '100%',
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'linear-gradient(45deg, #00FFFF, #0066FF)', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            📡
          </div>
          <span style={titleStyle}>HoyMismoGPS</span>
          <div style={{ fontSize: '12px', color: '#888', marginLeft: 'auto' }}>
            Conectado | {vehicles.length} dispositivos
          </div>
        </div>
      </header>

      {/* Main Content: Sidebar + Map */}
      <div style={mainContentStyle}>
        {/* Sidebar with vehicle list */}
        <div style={sidebarStyle}>
          <h3 style={{ 
            marginBottom: '15px', 
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
          }}>
            Vehículos en Tiempo Real
            <span style={{ 
              fontSize: '11px', 
              color: '#00FFFF', 
              background: 'rgba(0, 255, 255, 0.1)', 
              padding: '3px 6px', 
              borderRadius: '4px',
              marginLeft: '8px',
            }}>
              Actualizado cada 10s
            </span>
          </h3>
          
          {vehicles.length === 0 ? (
            <div style={cardStyle}>
              <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
                Esperando datos de dispositivos GPS...
              </div>
            </div>
          ) : (
            vehicles.map((vehicle) => (
              <div 
                key={vehicle.deviceId} 
                style={cardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = '#00FFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = '#333';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ 
                    background: vehicle.status === 'active' ? '#00FF66' : '#FF6600',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    display: 'inline-block',
                  }} />
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>
                    {vehicle.name}
                  </span>
                  <span style={{ fontSize: '20px', marginLeft: 'auto' }}>
                    {vehicle.vehicleType === 'truck' ? '🚛' :
                     vehicle.vehicleType === 'car' ? '🚗' :
                     vehicle.vehicleType === 'motorcycle' ? '🏍️' : '🚙'}
                  </span>
                </div>
                
                <div style={{ 
                  fontSize: '11px', 
                  color: '#888', 
                  fontFamily: 'monospace',
                  lineHeight: '1.4'
                }}>
                  {vehicle.lastKnownLocation ? (
                    <>
                      <div>{vehicle.deviceId}</div>
                      <div>
                        {vehicle.lastKnownLocation.latitude.toFixed(4)}°, {vehicle.lastKnownLocation.longitude.toFixed(4)}°
                      </div>
                      <div style={{ color: vehicle.lastKnownLocation.speed > 0 ? '#00FF66' : '#888' }}>
                        {Math.round(vehicle.lastKnownLocation.speed)} km/h
                      </div>
                    </>
                  ) : (
                    <div>Sin ubicación GPS</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Map */}
        <div style={mapContainerStyle}>
          <MapContainer />
        </div>
      </div>
    </div>
  );
}

export default App;