import React, { useEffect, useState } from 'react';

type Client = {
  id: number;
  name: string;
};

type Payment = {
  id: number;
  client?: Client;
  amount?: number;
  status?: 'Paid' | 'Pending' | 'Overdue';
  date?: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clientId, setClientId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'Paid' | 'Pending' | 'Overdue'>('Paid');
  const [date, setDate] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [paymentsRes, clientsRes] = await Promise.all([
          fetch('http://localhost:4000/api/payments'),
          fetch('http://localhost:4000/clients'),
        ]);
        const paymentsData = await paymentsRes.json();
        const clientsData = await clientsRes.json();
        setPayments(paymentsData);
        setClients(clientsData);
      } catch (e) {
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !amount || !date) {
      alert('Please fill all fields');
      return;
    }
    try {
      const res = await fetch('http://localhost:4000/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          amount: parseFloat(amount),
          status,
          date,
        }),
      });
      if (!res.ok) throw new Error('Failed to add payment');
      const newPayment = await res.json();
      setPayments([...payments, newPayment]);
      setClientId(null);
      setAmount('');
      setStatus('Paid');
      setDate('');
    } catch {
      setError('Failed to add payment.');
    }
  }

  async function handleDeletePayment(id: number) {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    try {
      const res = await fetch(`http://localhost:4000/api/payments/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete payment');
      setPayments(payments.filter(payment => payment.id !== id));
    } catch {
      alert('Failed to delete payment.');
    }
  }

  if (loading) return <p className="p-6 text-gray-500">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payment History</h1>

      <form onSubmit={handleAddPayment} className="mb-6 space-y-4 max-w-sm">
        <div>
          <label className="block mb-1">Client</label>
          <select
            value={clientId ?? ''}
            onChange={(e) => setClientId(Number(e.target.value))}
            className="border px-2 py-1 w-full"
            required
          >
            <option value="" disabled>Select client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Amount</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border px-2 py-1 w-full"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'Paid' | 'Pending' | 'Overdue')}
            className="border px-2 py-1 w-full"
          >
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border px-2 py-1 w-full"
            required
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Payment</button>
      </form>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">Client</th>
            <th className="border px-4 py-2">Date</th>
            <th className="border px-4 py-2">Amount</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Actions</th> {/* New header */}
          </tr>
        </thead>
        <tbody>
          {payments.map(payment => (
            <tr key={payment.id}>
              <td className="border px-4 py-2">{payment.client?.name ?? 'Unknown Client'}</td>
              <td className="border px-4 py-2">{payment.date ? new Date(payment.date).toLocaleDateString() : 'No date'}</td>
              <td className="border px-4 py-2">${payment.amount?.toFixed(2) ?? '0.00'}</td>
              <td className="border px-4 py-2">{payment.status ?? 'Unknown'}</td>
              <td className="border px-4 py-2 text-center">
                <button
                  onClick={() => handleDeletePayment(payment.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


