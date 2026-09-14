import { api } from '../../api/client';

export interface Maintenance {
  id: string;
  vehicleId: string;
  description: string;
  cost: number;
  odometer: number;
  performedAt: string;
  createdAt: string;
}

export interface MaintenanceInput {
  description: string;
  cost: number;
  odometer: number;
  performedAt: string; // ISO date (YYYY-MM-DD)
}

export async function listMaintenances(vehicleId: string): Promise<Maintenance[]> {
  const { data } = await api.get<Maintenance[]>(`/vehicles/${vehicleId}/maintenances`);
  return data;
}

export async function createMaintenance(vehicleId: string, input: MaintenanceInput): Promise<Maintenance> {
  const { data } = await api.post<Maintenance>(`/vehicles/${vehicleId}/maintenances`, input);
  return data;
}

export async function deleteMaintenance(vehicleId: string, id: string): Promise<void> {
  await api.delete(`/vehicles/${vehicleId}/maintenances/${id}`);
}
