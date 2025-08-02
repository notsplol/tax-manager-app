import type { Client } from '../../../main/generated/prisma';
//import { Prisma } from '../../../main/generated/prisma';

const API_URL = 'http://localhost:4000'; //backend URL

type SimpleClientInput = {
  name: string;
  email: string;
  phone?: string | null;
};


export async function fetchClients(): Promise<Client[]> {
  const res = await fetch(`${API_URL}/clients`);
  if (!res.ok) throw new Error('Failed to fetch clients');
  return res.json();
}

export async function addClient(clientData: SimpleClientInput) {
  const res = await fetch(`${API_URL}/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientData),
  });
  if (!res.ok) throw new Error('Failed to add client');
  return res.json();
}

export async function updateClient(id: number, clientData: Partial<Client>): Promise<Client> {
  const res = await fetch(`${API_URL}/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientData),
  });
  if (!res.ok) throw new Error('Failed to update client');
  return res.json();
}

export async function deleteClient(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/clients/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete client');
}

export async function fetchClientById(id: number): Promise<Client> {
  const res = await fetch(`${API_URL}/clients/${id}`);
  if (!res.ok) throw new Error('Failed to fetch client');
  return res.json();
}

export async function fetchPaymentsByClientId(id: number) {
  const res = await fetch(`${API_URL}/clients/${id}/payments`);
  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
}