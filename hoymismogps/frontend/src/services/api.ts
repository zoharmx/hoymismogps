import axios from 'axios';
// ERROR CORREGIDO: Se eliminó 'AxiosResponse' de la siguiente línea porque no se usaba.
import type { Vehicle, GPSLocation, Alert, Geofence, APIResponse } from '../types';

import { environment } from '../config/environment';

const API_BASE_URL = environment.API_BASE_URL;

class APIService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add API key
    this.axiosInstance.interceptors.request.use((config) => {
      const apiKey = localStorage.getItem('apiKey') || 'test_key_gps001';
      if (apiKey) {
        config.headers['X-API-Key'] = apiKey;
      }
      return config;
    });

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error?.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.axiosInstance.get('/health');
    return response.data;
  }

  // Vehicle endpoints
  async getVehicles(filters?: { status?: string; vehicleType?: string }): Promise<Vehicle[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.vehicleType) params.append('vehicle_type', filters.vehicleType);
    
    const response = await this.axiosInstance.get(`/api/v1/vehicles?${params.toString()}`);
    return response.data.vehicles || [];
  }

  // GPS tracking
  async trackVehicle(locationData: GPSLocation): Promise<APIResponse<{ success: boolean }>> {
    const response = await this.axiosInstance.post('/api/v1/track', locationData);
    return response.data;
  }

  // Vehicle history
  async getVehicleHistory(
    deviceId: string, 
    startDate: string, 
    endDate: string,
    organizationId: string = 'test_org_001'
  ): Promise<GPSLocation[]> {
    const response = await this.axiosInstance.post('/api/v1/history', {
      deviceId,
      startDate,
      endDate,
      organizationId,
    });
    return response.data.locations || [];
  }

  // Geofences
  async getGeofences(): Promise<Geofence[]> {
    const response = await this.axiosInstance.get('/api/v1/geofences');
    return response.data.geofences || [];
  }

  async createGeofence(geofence: Geofence): Promise<string> {
    const response = await this.axiosInstance.post('/api/v1/geofences', geofence);
    return response.data.geofenceId;
  }

  // Alerts
  async getAlerts(limit: number = 100, unreadOnly: boolean = false): Promise<Alert[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (unreadOnly) params.append('unread_only', 'true');
    
    const response = await this.axiosInstance.get(`/api/v1/alerts?${params.toString()}`);
    return response.data.alerts || [];
  }

  // Simulator controls (development only)
  async getSimulatorStatus(): Promise<{ running: boolean; vehicles: string[] }> {
    try {
      const response = await this.axiosInstance.get('/api/v1/simulator/status');
      return response.data;
    } catch {
      return { running: false, vehicles: [] };
    }
  }

  async controlSimulator(action: 'start' | 'stop'): Promise<{ success: boolean; message: string }> {
    const response = await this.axiosInstance.post('/api/v1/simulator/control', { action });
    return response.data;
  }
}

export const apiService = new APIService();
export default apiService;