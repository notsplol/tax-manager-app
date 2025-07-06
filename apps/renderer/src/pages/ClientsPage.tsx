import React, { useEffect, useState } from 'react';
import { fetchClients, addClient, deleteClient } from '../api/clients';
import type { Client } from '../../../main/generated/prisma';
import { NavLink } from 'react-router-dom';

const emailTemplates = [
  {
    id: 1,
    name: 'Tax Documents',
    subject: 'Attached: Tax {{year}} Documents',
    body: `Namaste {{name}},

Please find attached Tax documents {{year}}; please keep safe for next six years.

Thank you for the tax file with us. We appreciate you.

Best regards,
Vijay Patel
514 826 7442`
  },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [activeEmailClientId, setActiveEmailClientId] = useState<number | null>(null);
  const [activePaymentClientId, setActivePaymentClientId] = useState<number | null>(null);

  const navItems = [
    { label: 'Clients', to: '/clients' },
    { label: 'Payments', to: '/payments' },
    { label: 'Settings', to: '/settings' },
  ];

  useEffect(() => {
    async function loadClients() {
      try {
        const data = await fetchClients();
        setClients(data);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    loadClients();
  }, []);

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) return alert('Name and email are required');

    try {
      const newClient = await addClient({ name, email, phone: phone.trim() || null });
      setClients([...clients, newClient]);
      setName('');
      setEmail('');
      setPhone('');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleDeleteClient(id: number) {
    try {
      await deleteClient(id);
      setClients(clients.filter(client => client.id !== id));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function fillTemplate(template: { subject: string; body: string }) {
    const taxYear = (new Date().getFullYear() - 1).toString();
    const clientFirstName = selectedClient?.name.split(' ')[0] || '';
    return {
      subject: template.subject.replace(/{{year}}/g, taxYear).replace(/{{name}}/g, clientFirstName),
      body: template.body.replace(/{{year}}/g, taxYear).replace(/{{name}}/g, clientFirstName)
    };
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 grid grid-cols-[16rem_1fr]">
      <aside className="h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Navigation</h2>
        <ul className="space-y-3">
          {navItems.map(({ label, to }) => (
            <li key={label}>
              <NavLink
                to={to}
                className={({ isActive }: { isActive: boolean }) =>
                  `block px-4 py-2 rounded-lg font-medium transition ${
                    isActive
                      ? 'bg-blue-100 dark:bg-gray-800 text-blue-700 dark:text-white'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>

      <main className="p-8 ml-8">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-900 dark:text-white">Clients</h1>

        <form onSubmit={handleAddClient} className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-3 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="px-4 py-3 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
          />
          <button type="submit" className="sm:col-span-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition">Add Client</button>
        </form>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        ) : error ? (
          <p className="text-red-500 font-medium">{error}</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {clients.map((client) => (
              <div key={client.id} className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition">
                <div className="mb-3 ml-4">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{client.name}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{client.email}</p>
                  {client.phone && <p className="text-sm text-gray-600 dark:text-gray-400">{client.phone}</p>}
                </div>

                <div className="flex flex-wrap gap-8 justify-start mt-4 space-x-4 p-2">
  <button
    onClick={() => {
      if (window.confirm(`Are you sure you want to delete ${client.name}? This will also delete their payments.`)) {
        handleDeleteClient(client.id);
      }
    }}
    className="text-sm text-red-600 hover:underline font-medium"
  >
    Delete
  </button>
  <button
    onClick={() => {
      setSelectedClient(client);
      setActiveEmailClientId(activeEmailClientId === client.id ? null : client.id);
    }}
    className="text-sm text-blue-600 hover:underline font-medium"
  >
    Send Email
  </button>
  <button
    onClick={() => {
      setSelectedClient(client);
      setActivePaymentClientId(activePaymentClientId === client.id ? null : client.id);
    }}
    className="text-sm text-green-600 hover:underline font-medium"
  >
    Add Payment
  </button>
</div>


                {/* Inline Email Form */}
                {activeEmailClientId === client.id && (
                  <div className="mt-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Select Template</label>
                    <select
                      value={selectedTemplateId ?? ''}
                      onChange={(e) => setSelectedTemplateId(parseInt(e.target.value))}
                      className="w-full p-2 mb-4 border rounded dark:bg-gray-800 dark:text-white"
                    >
                      <option value="" disabled>Select an email template</option>
                      {emailTemplates.map((template) => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                    </select>

                    {selectedTemplateId && (
                      <>
                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Preview</label>
                        <textarea
                          value={fillTemplate(emailTemplates.find(t => t.id === selectedTemplateId)! ).body}
                          className="w-full min-h-[150px] p-4 rounded border dark:bg-gray-800 dark:text-white mb-4 resize-none text-sm"
                          readOnly
                        />
                      </>
                    )}
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setActiveEmailClientId(null)} className="px-3 py-2 rounded bg-gray-400 text-white">Cancel</button>
                      <button onClick={() => {
                        const selected = emailTemplates.find(t => t.id === selectedTemplateId);
                        if (selected && selectedClient) {
                          const filled = fillTemplate(selected);
                          alert(`Sending email to ${selectedClient.email}\n\nSubject: ${filled.subject}\n\n${filled.body}`);
                          setSelectedTemplateId(null);
                          setActiveEmailClientId(null);
                        }
                      }} className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Send</button>
                    </div>
                  </div>
                )}

                {/* Inline Payment Form */}
                {activePaymentClientId === client.id && (
                  <div className="mt-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const amount = parseFloat((form.elements.namedItem("amount") as HTMLInputElement).value);
                        const status = (form.elements.namedItem("status") as HTMLSelectElement).value;
                        const date = (form.elements.namedItem("date") as HTMLInputElement).value;

                        try {
                          const res = await fetch('http://localhost:4000/api/payments', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              clientId: client.id,
                              amount,
                              status,
                              date,
                            }),
                          });
                          if (!res.ok) throw new Error('Failed to add payment');
                          alert('Payment added!');
                          setActivePaymentClientId(null);
                        } catch (err) {
                          alert('Failed to add payment');
                        }
                      }}
                    >
                      <input name="amount" type="number" step="0.01" placeholder="Amount" required className="mb-2 p-2 w-full rounded" />
                      <select name="status" required className="mb-2 p-2 w-full rounded">
                        <option value="">Status</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                      <input name="date" type="date" required className="mb-4 p-2 w-full rounded" />
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setActivePaymentClientId(null)} className="px-3 py-2 bg-gray-400 text-white rounded">Cancel</button>
                        <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded">Add</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

