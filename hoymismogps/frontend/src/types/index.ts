
// Type definitions for HoyMismoGPS

export interface GPSLocation {
  deviceId: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  altitude?: number;
  gpsSignalStrength?: number;
  organizationId: string;
}

export interface Vehicle {
  deviceId: string;
  name: string;
  vehicleType: 'truck' | 'car' | 'motorcycle' | 'van' | 'bus';
  licensePlate?: string;
  driver?: string;
  organizationId: string;
  status: 'active' | 'inactive' | 'offline' | 'maintenance';
  maxSpeed?: number;
  createdAt: string;
  updatedAt: string;
  lastKnownLocation?: GPSLocation;
  batteryLevel?: number;
  lastSeen?: string;
}

export interface Geofence {
  id?: string;
  name: string;
  organizationId: string;
  coordinates: Array<{
    latitude: number;
    longitude: number;
  }>;
  description?: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface Alert {
  id?: string;
  organizationId: string;
  deviceId: string;
  vehicleName?: string;
  alertType: 'geofence_entry' | 'geofence_exit' | 'speeding' | 'offline' | 'low_battery';
  title: string;
  message: string;
  location?: GPSLocation;
  geofenceId?: string;
  isRead: boolean;
  isActive: boolean;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export interface DashboardStats {
  activeVehicles: number;
  connectivity: number;
  alerts: number;
  totalDistance: string;
}

export interface APIResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface FilterOptions {
  status: string;
  vehicleType: string;
}
