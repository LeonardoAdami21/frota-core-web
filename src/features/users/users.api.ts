import { api } from "../../api/client";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export async function listUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/users");
  return data;
}
