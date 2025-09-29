
import { create } from 'zustand';
import type { Vehicle, Alert, DashboardStats, FilterOptions, MapViewport, GPSLocation } from '../types';

interface AppState {
  // Authentication
  isAuthenticated: boolean;
  user: Record<string, unknown> | null;
  
  // Vehicles
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  
  // Alerts
  alerts: Alert[];
  unreadAlertsCount: number;
  
  // Dashboard stats
  stats: DashboardStats;
  
  // UI State
  filters: FilterOptions;
  mapViewport: MapViewport;
  sidebarOpen: boolean;
  
  // Loading states
  loading: {
    vehicles: boolean;
    alerts: boolean;
    stats: boolean;
  };
  
  // Actions
  setAuth: (isAuthenticated: boolean, user?: Record<string, unknown>) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  updateVehicleLocation: (deviceId: string, location: GPSLocation) => void;
  setAlerts: (alerts: Alert[]) => void;
  markAlertAsRead: (alertId: string) => void;
  setStats: (stats: DashboardStats) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  setMapViewport: (viewport: Partial<MapViewport>) => void;
  setSidebarOpen: (open: boolean) => void;
  setLoading: (key: keyof AppState['loading'], loading: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  isAuthenticated: false,
  user: null,
  vehicles: [],
  selectedVehicle: null,
  alerts: [],
  unreadAlertsCount: 0,
  stats: {
    activeVehicles: 0,
    connectivity: 0,
    alerts: 0,
    totalDistance: '0km',
  },
  filters: {
    status: 'all',
    vehicleType: 'all',
  },
  mapViewport: {
    latitude: 32.7157,
    longitude: -117.1611,
    zoom: 10,
  },
  sidebarOpen: true,
  loading: {
    vehicles: false,
    alerts: false,
    stats: false,
  },

  // Actions
  setAuth: (isAuthenticated, user) => {
    set({ isAuthenticated, user });
  },

  setVehicles: (vehicles) => {
    const state = get();
    set({ 
      vehicles,
      stats: {
        ...state.stats,
        activeVehicles: vehicles.filter(v => v.status === 'active').length,
        connectivity: vehicles.length > 0 ? 
          Math.round((vehicles.filter(v => v.status === 'active').length / vehicles.length) * 100) : 0,
      }
    });
  },

  setSelectedVehicle: (vehicle) => {
    set({ selectedVehicle: vehicle });
    
    // Update map viewport to center on selected vehicle
    if (vehicle?.lastKnownLocation) {
      set({
        mapViewport: {
          latitude: vehicle.lastKnownLocation.latitude,
          longitude: vehicle.lastKnownLocation.longitude,
          zoom: 15,
        }
      });
    }
  },

  updateVehicleLocation: (deviceId, location) => {
    const { vehicles } = get();
    const updatedVehicles = vehicles.map(vehicle => 
      vehicle.deviceId === deviceId 
        ? { 
            ...vehicle, 
            lastKnownLocation: location,
            lastSeen: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : vehicle
    );
    set({ vehicles: updatedVehicles });
  },

  setAlerts: (alerts) => {
    const unreadCount = alerts.filter(alert => !alert.isRead).length;
    set({ 
      alerts, 
      unreadAlertsCount: unreadCount,
      stats: {
        ...get().stats,
        alerts: unreadCount,
      }
    });
  },

  markAlertAsRead: (alertId) => {
    const { alerts } = get();
    const updatedAlerts = alerts.map(alert =>
      alert.id === alertId ? { ...alert, isRead: true } : alert
    );
    set({ alerts: updatedAlerts });
  },

  setStats: (stats) => {
    set({ stats });
  },

  setFilters: (newFilters) => {
    const { filters } = get();
    set({ filters: { ...filters, ...newFilters } });
  },

  setMapViewport: (viewport) => {
    const { mapViewport } = get();
    set({ mapViewport: { ...mapViewport, ...viewport } });
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },

  setLoading: (key, loading) => {
    const currentLoading = get().loading;
    set({ loading: { ...currentLoading, [key]: loading } });
  },
}));

export default useAppStore;
