import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Client, Payment } from '../../../main/generated/prisma';
import { fetchClientById, fetchPaymentsByClientId } from '../api/clients';


export default function ClientPage() {
  const { id } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (id) {
      fetchClientById(Number(id)).then(setClient);
      fetchPaymentsByClientId(Number(id)).then(setPayments);
    }
  }, [id]);

  if (!client) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">{client.name}</h1>
      <p>Email: {client.email}</p>
      <p>Phone: {client.phone}</p>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Documents</h2>
        {/* File upload UI + existing files here */}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Payments</h2>
        {/* You can reuse your Payments table component and filter it */}
        {/* Or just display payments in a simple list */}
        <ul className="space-y-2">
          {payments.map((payment) => (
            <li key={payment.id} className="bg-[#2a2a2a] p-4 rounded-lg">
              ${payment.amount} — {payment.status} — {new Date(payment.date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
