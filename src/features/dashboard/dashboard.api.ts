import { api } from "../../api/client";

export interface DashboardData {
  fleet: {
    total: number;
    active: number;
    maintenance: number;
    inactive: number;
  };
  costs: {
    maintenance: number;
    fueling: number;
    expense: number;
    total: number;
  };
  costByVehicle: {
    vehicleId: string;
    label: string;
    plate: string;
    total: number;
  }[];
  alerts: {
    vehicleId: string;
    plate: string;
    type: string;
    dueDate: string;
    daysUntilDue: number;
    overdue: boolean;
  }[];
}

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await api.get<DashboardData>("/dashboard");
  return data;
}
