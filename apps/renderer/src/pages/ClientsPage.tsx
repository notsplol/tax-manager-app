import React, { useEffect, useState } from 'react';
import {
  Users,
  CreditCard,
  Settings,
  Plus,
  Mail,
  DollarSign,
  Trash2,
  X,
  Send,
  User,
  Phone,
  AtSign,
  Calendar,
  Check,
} from 'lucide-react';

import type { Client } from '../../../main/generated/prisma';
import { fetchClients, addClient, deleteClient } from '../api/clients';

const emailTemplates = [
  {
    id: 1,
    name: 'Tax Documents',
    subject: 'Attached: Tax {{year}} Documents',
    body: `Namaste {{name}},

Please find attached your tax documents {{year}}; We suggest you keep them safe for the next six years.
If you have any further questions, contact us and we'll be happy to assist.

Thank you for filing your taxes with us, we hope to see you next year!

Best regards,
Vijay Patel
514 826 7442`,
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
  const [showAddForm, setShowAddForm] = useState(false);

  const navItems = [
    { label: 'Clients', to: '/clients', icon: <Users className="w-5 h-5" style={{ marginRight: '0.55rem', marginLeft: '0.2rem'}}/> },
    { label: 'Payments', to: '/payments', icon: <CreditCard className="w-5 h-5" style={{ marginRight: '0.55rem', marginLeft: '0.2rem'}}/> },
    { label: 'Settings', to: '/settings', icon: <Settings className="w-5 h-5" style={{ marginRight: '0.55rem', marginLeft: '0.2rem'}}/> },
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
      setShowAddForm(false);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleDeleteClient(id: number) {
    try {
      await deleteClient(id);
      setClients(clients.filter((client) => client.id !== id));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function fillTemplate(template: { subject: string; body: string }) {
    const taxYear = (new Date().getFullYear() - 1).toString();
    const clientFirstName = selectedClient?.name.split(' ')[0] || '';
    return {
      subject: template.subject.replace(/{{year}}/g, taxYear).replace(/{{name}}/g, clientFirstName),
      body: template.body.replace(/{{year}}/g, taxYear).replace(/{{name}}/g, clientFirstName),
    };
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 grid grid-cols-[16rem_1fr] gap-x-20">
      {/* Sidebar */}
      <aside className="h-screen bg-[#2f2f2f] backdrop-blur-md p-6 flex flex-col shadow-xl shadow-black/10">
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-7 h-7 text-white" style={{ marginRight: '0.35rem', marginLeft: '1rem'}} />
            </div>
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text dark:text-white">
              Vijay Patel
            </h2>
          </div>
        </div>

        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%' }}>
          {navItems.map((item) => (
          <li key={item.label} style={{ marginBottom: '0.75rem' }}>
            <a
              href={item.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'transparent',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                width: '80%',
                textDecoration: 'none',
                color: 'white',
                fontWeight: 500,
                fontSize: '1rem',
                transition: 'background-color 0.3s ease',
                }}
                onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = 'rgba(34, 255, 255, 0.1)')
                }
                onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = 'transparent')
                }
                  >
              {item.icon}
              {item.label}
            </a>
         </li>
              ))}
          </ul>

        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-visible px-10 py-10">
        <div className="max-w-7xl mx-auto px-8 py-12 overflow-visible grid gap-6">
          <div className="mb-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold mb-10 text-gray-900 dark:text-white"> Client Management</h1>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="group flex items-center px-8 py-4 ml-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.01] hover:-translate-y-1"
              >
                <Plus className="w-6 h-6 mr-3 transition-transform group-hover:rotate-180" />
                Add New Client
              </button>
            </div>
          </div>

          {/* Add Client Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddClient}
              className="mb-10 bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl"
              noValidate
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Plus className="w-7 h-7 mr-3 text-blue-600" />
                  Add New Client
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-200 group"
                >
                  <X className="w-6 h-6 text-gray-500 group-hover:text-gray-700 group-hover:rotate-90 transition-all duration-200" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-visible">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500 font-medium"
                    required
                  />
                </div>

                <div className="relative group">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500 font-medium"
                    required
                  />
                </div>

                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500 font-medium"
                  />
                </div>

                <div className="md:col-span-3 flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-8 py-4 text-gray-600 hover:text-gray-800 font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                  >
                  <Check className="w-5 h-5 mr-2" />
                    Add Client
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Status Messages */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent shadow-lg"></div>
              <p className="mt-4 text-lg text-gray-600 font-medium">Loading clients...</p>
            </div>
          ) : error ? (
            <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-2xl shadow-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-4">
                  <X className="w-5 h-5 text-white" />
                </div>
                <p className="text-red-700 font-semibold text-lg">{error}</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', rowGap: '1.5rem'}}>
              {clients.map((client: Client) => (
                <div
                  key={client.id}
                  className="group bg-white/5 backdrop-blur-md border border-white/10 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] rounded-3xl"
                  style={{ marginLeft: '2rem',
                    borderRadius: '1.5rem',
                    padding: '1rem',
                    paddingLeft: '1rem',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                    e.currentTarget.style.transform = 'scale(1.01)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                > 
                  {/* Client Info */}
                  <div className="mb-8">
                    <div className="flex items-center mb-6 gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                        
                      </div>
                      <div className="flex flex-col justify-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{client.name}</h3>
                        <p className="text-sm text-gray-500 font-medium">Client ID: #{client.id}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700 bg-gray-50 rounded-xl p-3">
                        <AtSign className="w-5 h-5 mr-3 text-blue-500" style={{ marginRight: '0.35rem', marginBottom: '0.5rem', paddingTop: '0.75rem'}}/>
                        <span className="font-medium">{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center text-gray-700 bg-gray-50 rounded-xl p-3">
                          <Phone className="w-5 h-5 mr-3 text-green-500" style={{ marginRight: '0.35rem'}}/>
                          <span className="font-medium">{client.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        setActiveEmailClientId(activeEmailClientId === client.id ? null : client.id);
                      }}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <Mail className="w-4 h-4 mr-2" style={{ marginRight: '0.35rem'}}/>
                      Email
                    </button>
                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        setActivePaymentClientId(activePaymentClientId === client.id ? null : client.id);
                      }}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Payment
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to delete ${client.name}? This will also delete their payments.`
                          )
                        ) {
                          handleDeleteClient(client.id);
                        }
                      }}
                      className="px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Inline Email Form */}
                  {activeEmailClientId === client.id && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200 shadow-inner space-y-4">
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Select Template
                      </label>
                      <select
                        value={selectedTemplateId ?? ''}
                        onChange={(e) => setSelectedTemplateId(parseInt(e.target.value))}
                        className="w-full p-4 mb-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 font-medium"
                      >
                        <option value="" disabled>
                          Select an email template
                        </option>
                        {emailTemplates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>

                      {selectedTemplateId && (
                        <>
                          <label className="block mb-2 text-sm font-semibold text-gray-700">
                            Preview
                          </label>
                          <textarea
                            value={fillTemplate(
                              emailTemplates.find((t) => t.id === selectedTemplateId)!
                            ).body}
                            className="w-full min-h-[170px] p-4 rounded border bg-white border-2 border-gray-200 mb-4 resize-none text-sm text-gray-900 font-medium"
                            readOnly
                          />
                        </>
                      )}

                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setActiveEmailClientId(null)}
                          className="px-4 py-2 rounded bg-gray-400 text-white font-semibold hover:bg-gray-500 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            const selected = emailTemplates.find((t) => t.id === selectedTemplateId);
                            if (selected && selectedClient) {
                              const filled = fillTemplate(selected);
                              alert(
                                `Sending email to ${selectedClient.email}\n\nSubject: ${filled.subject}\n\n${filled.body}`
                              );
                              setSelectedTemplateId(null);
                              setActiveEmailClientId(null);
                            }
                          }}
                          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Inline Payment Form */}
                  {activePaymentClientId === client.id && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200 shadow-inner space-y-4">
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const amount = parseFloat(
                            (form.elements.namedItem('amount') as HTMLInputElement).value
                          );
                          const status = (form.elements.namedItem('status') as HTMLSelectElement).value;
                          const date = (form.elements.namedItem('date') as HTMLInputElement).value;

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
                        <input
                          name="amount"
                          type="number"
                          step="0.01"
                          placeholder="Amount"
                          required
                          className="mb-3 p-4 w-full rounded-xl border-2 border-gray-200 bg-white text-gray-900 font-medium focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500"
                        />
                        <select
                          name="status"
                          required
                          className="mb-3 p-4 w-full rounded-xl border-2 border-gray-200 bg-white text-gray-900 font-medium focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500"
                        >
                          <option value="" disabled>
                            Select Status
                          </option>
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                        <input
                          name="date"
                          type="date"
                          required
                          className="mb-4 p-4 w-full rounded-xl border-2 border-gray-200 bg-white text-gray-900 font-medium focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500"
                        />
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setActivePaymentClientId(null)}
                            className="px-4 py-2 bg-gray-400 text-white rounded font-semibold hover:bg-gray-500 transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition"
                          >
                            Add
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}





