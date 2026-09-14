import { api } from "../../api/client";

export type VehicleStatus = "ATIVO" | "MANUTENCAO" | "INATIVO";

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  brand: string;
  year: number;
  odometer: number;
  status: VehicleStatus;
  driver: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleInput {
  plate: string;
  model: string;
  brand: string;
  year: number;
  odometer: number;
  status: VehicleStatus;
  driver?: string;
}

export async function listVehicles(): Promise<Vehicle[]> {
  const { data } = await api.get<Vehicle[]>("/vehicles");
  return data;
}

export async function getVehicle(id: string): Promise<Vehicle> {
  const { data } = await api.get<Vehicle>(`/vehicles/${id}`);
  return data;
}

export async function createVehicle(input: VehicleInput): Promise<Vehicle> {
  const { data } = await api.post<Vehicle>("/vehicles", input);
  return data;
}

export async function updateVehicle(
  id: string,
  input: Partial<VehicleInput>,
): Promise<Vehicle> {
  const { data } = await api.patch<Vehicle>(`/vehicles/${id}`, input);
  return data;
}

export async function deleteVehicle(id: string): Promise<void> {
  await api.delete(`/vehicles/${id}`);
}
