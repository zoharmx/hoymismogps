
import React, { useEffect, useState } from 'react';
import type { Vehicle } from './types';

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
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchVehicles, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const appStyle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    background: '#0a0a0a',
    color: '#ffffff',
    minHeight: '100vh',
    padding: '20px',
  };

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '1px solid #333',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: '700',
    background: 'linear-gradient(45deg, #00FFFF, #0066FF)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
  };

  if (loading) {
    return (
      <div style={appStyle}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '18px', color: '#00FFFF' }}>
            🔄 Cargando datos GPS en tiempo real...
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
            ❌ {error}
          </div>
          <div style={{ fontSize: '14px', color: '#888' }}>
            Verificando conexión con backend en puerto 8080...
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
            width: '45px', 
            height: '45px', 
            background: 'linear-gradient(45deg, #00FFFF, #0066FF)', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            📡
          </div>
          <span style={titleStyle}>HoyMismoGPS</span>
          <div style={{ fontSize: '12px', color: '#888', marginLeft: 'auto' }}>
            🟢 Conectado | {vehicles.length} dispositivos
          </div>
        </div>
      </header>

      {/* Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={cardStyle}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#00FFFF', fontFamily: 'monospace' }}>
            {vehicles.length}
          </div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
            📱 Dispositivos GPS
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#00FF66', fontFamily: 'monospace' }}>
            {vehicles.filter(v => v.status === 'active').length}
          </div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
            🟢 Vehículos Activos
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#FFD700', fontFamily: 'monospace' }}>
            {vehicles.length > 0 ? Math.round((vehicles.filter(v => v.status === 'active').length / vehicles.length) * 100) : 0}%
          </div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
            📶 Conectividad Total
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#FF69B4', fontFamily: 'monospace' }}>
            &lt;2s
          </div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
            ⚡ Latencia Tiempo Real
          </div>
        </div>
      </div>

      {/* Vehicles List */}
      <div>
        <h2 style={{ marginBottom: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🚛 Lista de Vehículos GPS en Tiempo Real
          <span style={{ 
            fontSize: '12px', 
            color: '#00FFFF', 
            background: 'rgba(0, 255, 255, 0.1)', 
            padding: '4px 8px', 
            borderRadius: '4px' 
          }}>
            Actualizado cada 10s
          </span>
        </h2>
        
        {vehicles.length === 0 ? (
          <div style={cardStyle}>
            <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
              📡 Esperando datos de dispositivos GPS...
            </div>
          </div>
        ) : (
          vehicles.map((vehicle) => (
            <div key={vehicle.deviceId} style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ 
                      background: vehicle.status === 'active' ? '#00FF66' : '#FF6600',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      display: 'inline-block',
                      boxShadow: `0 0 10px ${vehicle.status === 'active' ? '#00FF66' : '#FF6600'}`
                    }} />
                    {vehicle.deviceId} - {vehicle.name}
                    <span style={{ 
                      fontSize: '12px',
                      background: 'rgba(0, 102, 255, 0.2)',
                      color: '#00FFFF',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {vehicle.vehicleType}
                    </span>
                  </div>
                  
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#888', 
                    fontFamily: 'monospace',
                    lineHeight: '1.5'
                  }}>
                    {vehicle.lastKnownLocation ? (
                      <>
                        📍 Coordenadas: {vehicle.lastKnownLocation.latitude.toFixed(4)}°, {vehicle.lastKnownLocation.longitude.toFixed(4)}°
                        <br />
                        🚀 Velocidad: <span style={{ color: vehicle.lastKnownLocation.speed > 0 ? '#00FF66' : '#888' }}>
                          {Math.round(vehicle.lastKnownLocation.speed)} km/h
                        </span>
                        <br />
                        📶 Estado: <span style={{ color: vehicle.status === 'active' ? '#00FF66' : '#FF6600' }}>
                          {vehicle.status === 'active' ? 'En línea y transmitiendo' : 'Desconectado'}
                        </span>
                      </>
                    ) : (
                      '📍 Sin ubicación GPS disponible'
                    )}
                  </div>
                </div>
                
                <div style={{ 
                  fontSize: '24px', 
                  opacity: vehicle.status === 'active' ? 1 : 0.5 
                }}>
                  {vehicle.vehicleType === 'truck' ? '🚛' :
                   vehicle.vehicleType === 'car' ? '🚗' :
                   vehicle.vehicleType === 'motorcycle' ? '🏍️' :
                   vehicle.vehicleType === 'van' ? '🚐' : '🚙'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '30px', 
        padding: '20px', 
        borderTop: '1px solid #333',
        fontSize: '14px',
        color: '#888'
      }}>
        <div style={{ marginBottom: '10px' }}>
          🚀 <strong>HoyMismoGPS</strong> - Plataforma SaaS de Rastreo GPS en Tiempo Real
        </div>
        <div style={{ fontSize: '12px', color: '#555' }}>
          🔧 Backend: Conectado | 🌐 Frontend: Vercel |
          ⚡ Tiempo real con latencia &lt;2s |
          📡 Dispositivos GPS activos
        </div>
      </div>
    </div>
  );
}

export default App;
