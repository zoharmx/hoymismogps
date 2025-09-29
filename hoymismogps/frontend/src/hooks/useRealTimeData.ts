
import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { apiService } from '../services/api';

export const useRealTimeData = () => {
  const { 
    setVehicles, 
    setAlerts, 
    setLoading,
    updateVehicleLocation,
    isAuthenticated 
  } = useAppStore();
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch vehicles data
  const fetchVehicles = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading('vehicles', true);
      const vehicles = await apiService.getVehicles();
      setVehicles(vehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading('vehicles', false);
    }
  };

  // Fetch alerts data
  const fetchAlerts = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading('alerts', true);
      const alerts = await apiService.getAlerts();
      setAlerts(alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading('alerts', false);
    }
  };

  // Poll for updates every 2 seconds for real-time feel
  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial fetch
    fetchVehicles();
    fetchAlerts();

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      fetchVehicles();
    }, 2000); // 2 second intervals for near real-time

    // Fetch alerts less frequently (every 10 seconds)
    const alertInterval = setInterval(() => {
      fetchAlerts();
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearInterval(alertInterval);
    };
  }, [isAuthenticated]);

  // Simulate real-time location updates (for demo purposes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const simulateLocationUpdates = setInterval(() => {
      // This would normally come from WebSocket or Firebase listeners
      // For demo, we're simulating small location changes
      const vehicles = useAppStore.getState().vehicles;
      
      vehicles.forEach((vehicle) => {
        if (vehicle.lastKnownLocation && vehicle.status === 'active') {
          const newLocation = {
            ...vehicle.lastKnownLocation,
            latitude: vehicle.lastKnownLocation.latitude + (Math.random() - 0.5) * 0.001,
            longitude: vehicle.lastKnownLocation.longitude + (Math.random() - 0.5) * 0.001,
            speed: Math.max(0, vehicle.lastKnownLocation.speed + (Math.random() - 0.5) * 10),
            timestamp: new Date().toISOString(),
          };
          
          updateVehicleLocation(vehicle.deviceId, newLocation);
        }
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(simulateLocationUpdates);
  }, [isAuthenticated]);

  return {
    refetch: () => {
      fetchVehicles();
      fetchAlerts();
    }
  };
};

export default useRealTimeData;
