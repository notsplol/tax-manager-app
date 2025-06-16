import React, { useEffect, useState } from 'react';
import { fetchClients, addClient, deleteClient } from '../api/clients';
import type { Client } from '../../../main/generated/prisma';
import ClientForm from './ClientForm';

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load clients on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchClients();
        setClients(data);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDeleteClient(id: number) {
    setError(null);
    try {
      await deleteClient(id);
      setClients(clients.filter(c => c.id !== id));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleAddClient(newClientData: { name: string; email: string; phone?: string | null }) {
    setError(null);
    try {
      // Convert empty phone string to null before sending
      const sanitizedClientData = {
        ...newClientData,
        phone: newClientData.phone?.trim() === '' ? null : newClientData.phone,
      };
      const newClient = await addClient(sanitizedClientData);
      setClients([...clients, newClient]);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (loading) return <p>Loading clients...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
  <h1 className="text-3xl font-semibold mb-8 text-gray-900">Clients</h1>
  <ul className="space-y-6">
    {clients.map(client => (
      <li
        key={client.id}
        className="flex justify-between items-center bg-gray-50 rounded-lg px-6 py-4 shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        <div>
          <p className="text-xl font-semibold text-gray-900">{client.name}</p>
          <p className="text-gray-600 mt-1">Email: <span className="text-gray-700">{client.email}</span></p>
          {client.phone && (
            <p className="text-gray-600 mt-1">Phone: <span className="text-gray-700">{client.phone}</span></p>
          )}
        </div>
        <button
          onClick={() => handleDeleteClient(client.id)}
          className="text-red-500 font-semibold hover:text-red-600 transition-colors duration-200"
          aria-label={`Delete client ${client.name}`}
          title={`Delete ${client.name}`}
        >
          &#10005; {/* Elegant cross icon */}
        </button>
      </li>
    ))}
  </ul>

      <ClientForm onAddClient={handleAddClient} />
    </div>
  );
}