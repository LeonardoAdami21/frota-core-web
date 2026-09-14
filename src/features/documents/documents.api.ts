import { api } from "../../api/client";

export type DocumentType =
  "IPVA" | "SEGURO" | "LICENCIAMENTO" | "DPVAT" | "VISTORIA";
export type DocumentStatus = "PENDENTE" | "PAGO";

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  type: DocumentType;
  dueDate: string;
  amount: number;
  status: DocumentStatus;
  daysUntilDue: number;
  overdue: boolean;
  createdAt: string;
}

export interface DocumentInput {
  type: DocumentType;
  dueDate: string;
  amount: number;
  status?: DocumentStatus;
}

export async function listDocuments(
  vehicleId: string,
): Promise<VehicleDocument[]> {
  const { data } = await api.get<VehicleDocument[]>(
    `/vehicles/${vehicleId}/documents`,
  );
  return data;
}

export async function createDocument(
  vehicleId: string,
  input: DocumentInput,
): Promise<VehicleDocument> {
  const { data } = await api.post<VehicleDocument>(
    `/vehicles/${vehicleId}/documents`,
    input,
  );
  return data;
}

export async function payDocument(
  vehicleId: string,
  id: string,
): Promise<VehicleDocument> {
  const { data } = await api.patch<VehicleDocument>(
    `/vehicles/${vehicleId}/documents/${id}/pay`,
  );
  return data;
}

export async function deleteDocument(
  vehicleId: string,
  id: string,
): Promise<void> {
  await api.delete(`/vehicles/${vehicleId}/documents/${id}`);
}
