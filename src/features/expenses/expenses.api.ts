import { api } from "../../api/client";

export type ExpenseCategory =
  "PNEUS" | "PEDAGIO" | "LAVAGEM" | "MULTA" | "ESTACIONAMENTO" | "OUTROS";

export interface Expense {
  id: string;
  vehicleId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  spentAt: string;
  createdAt: string;
}

export interface ExpenseInput {
  category: ExpenseCategory;
  description: string;
  amount: number;
  spentAt: string;
}

export async function listExpenses(vehicleId: string): Promise<Expense[]> {
  const { data } = await api.get<Expense[]>(`/vehicles/${vehicleId}/expenses`);
  return data;
}

export async function createExpense(
  vehicleId: string,
  input: ExpenseInput,
): Promise<Expense> {
  const { data } = await api.post<Expense>(
    `/vehicles/${vehicleId}/expenses`,
    input,
  );
  return data;
}

export async function deleteExpense(
  vehicleId: string,
  id: string,
): Promise<void> {
  await api.delete(`/vehicles/${vehicleId}/expenses/${id}`);
}
