import { api } from "../../api/client";

export interface Fueling {
  id: string;
  vehicleId: string;
  liters: number;
  totalCost: number;
  pricePerLiter: number;
  odometer: number;
  fueledAt: string;
  createdAt: string;
}

export interface FuelingInput {
  liters: number;
  totalCost: number;
  odometer: number;
  fueledAt: string; // ISO date
}

export async function listFuelings(vehicleId: string): Promise<Fueling[]> {
  const { data } = await api.get<Fueling[]>(`/vehicles/${vehicleId}/fuelings`);
  return data;
}

export async function createFueling(
  vehicleId: string,
  input: FuelingInput,
): Promise<Fueling> {
  const { data } = await api.post<Fueling>(
    `/vehicles/${vehicleId}/fuelings`,
    input,
  );
  return data;
}

export async function deleteFueling(
  vehicleId: string,
  id: string,
): Promise<void> {
  await api.delete(`/vehicles/${vehicleId}/fuelings/${id}`);
}
