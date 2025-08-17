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
  User,
  Phone,
  AtSign,
  Check,
  Search
} from 'lucide-react';

import type { Client } from '../../../main/generated/prisma';
import { fetchClients, addClient, deleteClient } from '../api/clients';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const emailTemplates = [
  {
    id: 1,
    name: 'Tax Documents',
    subject: 'Attached: Tax {{year}} Documents',
    body: `Good Evening {{name}},

    Template`,
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
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const navItems = [
    { label: 'Clients', to: '/clients', icon: <Users className="w-5 h-5 mr-[0.55rem]"/> },
    { label: 'Payments', to: '/payments', icon: <CreditCard className="w-5 h-5 mr-[0.55rem]"/> },
    { label: 'Settings', to: '/settings', icon: <Settings className="w-5 h-5 mr-[0.55rem]"/> },
  ];

  const filteredClients = clients.filter((client) =>
  client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  function fillTemplate(template: { subject: string; body: string }, clientName: string) {
  const taxYear = (new Date().getFullYear() - 1).toString();
  const clientFirstName = clientName.split(' ')[0] || '';
  return {
    subject: template.subject.replace(/{{year}}/g, taxYear).replace(/{{name}}/g, clientFirstName),
    body: template.body.replace(/{{year}}/g, taxYear).replace(/{{name}}/g, clientFirstName),
  };
}


const handleSendEmail = async () => {
  if (!selectedTemplateId || !selectedClient) return;

  const selected = emailTemplates.find((t) => t.id === selectedTemplateId);
  if (!selected) return;

  const filled = fillTemplate(selected, selectedClient.name);

  try {
    await axios.post('http://localhost:4000/api/email/send-email', {
      to: selectedClient.email,
      subject: filled.subject,
      body: filled.body,
    });

    alert('Email sent successfully!');
    setSelectedTemplateId(null);
    setActiveEmailClientId(null);
  } catch (error) {
    console.error('Error sending email:', error);
    alert('Failed to send email. Please try again.');
  }
};

  return (
    
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 grid grid-cols-[0rem_1fr] gap-x-20">
      {/* Sidebar */}
      <aside className="fixed h-screen bg-[#3c3c3c] backdrop-blur-md p-6 flex flex-col shadow-xl shadow-black/10 w-[15rem]">
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text dark:text-white">
              User
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
                width: '100%',
                textDecoration: 'none',
                color: 'white',
                fontWeight: 500,
                fontSize: '1rem',
                transition: 'background-color 0.3s ease',
                }}
                onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = '#1a1a1a')
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
      <main className="ml-[14rem] flex-1 px-10 py-10">
        <div className="max-w-7xl mx-auto px-8 py-12 overflow-visible grid gap-6">
          <div className="mb-10">
            <div className="flex items-center justify-between">
              <div> 
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-light">Client Management</h1>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="group flex items-center px-8 py-4 ml-4  from-gray-900 to-gray-800 hover:from-gray-900 hover:to-gray-800 text-white font-bold rounded-2xl shadow-2xl shadow-black-500/30 hover:shadow-2xl hover:shadow-black-500/40 transition-all duration-300 transform hover:scale-[1.01] hover:-translate-y-1"
              >
                <Plus className="w-4 h-6 mr-2 transition-transform group-hover:rotate-180" />
                Add New Client
              </button>
            </div>
          </div>

          {/* Add Client Form */}
          {showAddForm && (
  <form
    onSubmit={handleAddClient}
    className="mb-[1rem] bg-[#272727]/80 backdrop-blur-xl rounded-[1rem] p-8 border border-white/10 shadow-2xl shadow-black/30 text-white ml-[2rem]"
    noValidate
  >
    <div className="flex items-center justify-between">
      <h3 className="text-2xl font-bold flex items-center">
        <Plus className="w-7 h-7 mr-3 text-emerald-400" />
        Add New Client
      </h3>
      <button
        type="button"
        onClick={() => setShowAddForm(false)}
        className="p-3 hover:bg-white/10 rounded-2xl transition-all duration-200 group"
      >
        <X className="w-6 h-6 text-gray-400 group-hover:text-white group-hover:rotate-90 transition-all duration-200" />
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-[1rem] ml-[0.75rem] mt-[0.5rem]">
      {/* Name */}
      <div className="relative group">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="pl-4 pr-4 py-[0.5rem] bg-[#474747]/60 border border-white/20 rounded-[0.3rem] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all duration-300 text-white placeholder-gray-300 font-medium"
          required
        />
      </div>

      {/* Email */}
      <div className="relative group">
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-4 pr-4 py-[0.5rem] bg-[#474747]/60 border border-white/20 rounded-[0.3rem] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all duration-300 text-white placeholder-gray-300 font-medium"
          required
        />
      </div>

      {/* Phone */}
      <div className="relative group">
        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="pl-4 pr-4 py-[0.5rem] bg-[#474747]/60 border border-white/20 rounded-[0.3rem] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all duration-300 text-white placeholder-gray-300 font-medium"
        />
      </div>

      {/* Buttons */}
      <div className="md:col-span-3 flex justify-end space-x-4 pt-6">
        <button
          type="button"
          onClick={() => setShowAddForm(false)}
          className="px-6 py-3 text-gray-300 hover:text-white font-semibold rounded-2xl hover:bg-white/10 transition-all duration-200 mb-[0.3rem]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 text-white font-bold rounded-2xl shadow-md transition-all duration-300 transform hover:scale-105 flex items-center justify-center mb-[0.3rem]"
        >
          <Check className="w-5 h-5 mr-[0.4rem]" />
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
          ) : ( <>

              {/* SEARCH INPUT */}
              <div className="px-4 mb-8 flex justify-start">
                <div className="relative w-full max-w-md rounded-full">
                  <input
                    type="text"
                    placeholder="Search clients..."
                    className="w-[50rem] pl-10 pr-4 py-3 rounded-[0.5rem] bg-white/90 backdrop-blur border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200 text-gray-800 placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400 mt-[0.15rem]" />
                  <p className="text-[0.9rem] text-gray-300 font-[450] ml-[1rem] mt-[1rem]">
                    You have {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'}
                  </p>
                </div>
              </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', rowGap: '2rem', width: '50rem'}}>
              {clients.filter((client) =>
                client.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                .sort((a, b) => {
                  const query = searchQuery.toLowerCase();
                  const aName = a.name.toLowerCase();
                  const bName = b.name.toLowerCase();

                  const aStarts = aName.startsWith(query);
                  const bStarts = bName.startsWith(query);

                  if (aStarts && !bStarts) return -1;
                  if (!aStarts && bStarts) return 1;
                  return aName.localeCompare(bName);
                }).map((client: Client) => (
                  <div
                  key={client.id}
                  className="group bg-white/5 backdrop-blur-md border border-white/10 shadow-lg hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] rounded-3xl"
                  style={{ marginLeft: '2rem',
                    borderRadius: '1.5rem',
                    padding: '1rem',
                    paddingLeft: '1rem',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#3c3c3c',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 25px 50px -10px rgba(0, 0, 0, 0.25)';
                    e.currentTarget.style.transform = 'scale(1.01)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onClick={() => navigate(`/clients/${client.id}`

                  )}
                > 
                  {/* Client Info */}
                  <div className="mb-8">
                    <div className="flex items-center mb-6 gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <User className="w-7 h-7"/>
                      </div>
                      <div className="flex flex-col justify-center">
                        <h3 className="text-xl font-light text-white">{client.name}</h3>
                        <p className="text-sm text-white-500 font-medium">Client ID: #{client.id}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700 bg-gray-50 rounded-xl p-3">
                        <AtSign className="w-5 h-5 mr-3 text-blue-500"/>
                        <span className="font-medium">{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center text-gray-700 bg-gray-50 rounded-xl p-3">
                          <Phone className="w-5 h-5 mr-3 text-green-500"/>
                          <span className="font-medium">{client.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClient(client);
                        setActiveEmailClientId(activeEmailClientId === client.id ? null : client.id);
                      }}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-br from-gray-900 to-gray-800 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <Mail className="w-4 h-4 mr-2" style={{ marginRight: '0.35rem'}}/>
                      Email
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClient(client);
                        setActivePaymentClientId(activePaymentClientId === client.id ? null : client.id);
                      }}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-br from-gray-900 to-gray-800 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Payment
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            `Are you sure you want to delete ${client.name}? This will also delete their payments.`
                          )
                        ) {
                          handleDeleteClient(client.id);
                        }
                      }}
                      className="px-4 py-3 bg-gradient-to-br from-gray-900 to-gray-800 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Inline Email Form */}
                  {activeEmailClientId === client.id && (
                    <form onSubmit={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()}>
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
                              emailTemplates.find((t) => t.id === selectedTemplateId)!,
                              selectedClient?.name || ''
                            ).body}
                            className="w-full min-h-[170px] p-4 rounded border bg-white border-2 border-gray-200 mb-4 resize-none text-sm text-gray-900 font-medium"
                            readOnly
                          />
                        </>
                      )}

                      <div className="flex justify-end gap-3">
                        <button type="button"
                          onClick={(e) => {e.stopPropagation(); setActiveEmailClientId(null)}}
                          className="px-4 py-2 rounded bg-gray-400 text-white font-semibold hover:bg-gray-500 transition"
                        >
                          Cancel
                        </button>
                        <button type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendEmail();
                          }}
                          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </form>
                  )} 

                  {/* Inline Payment Form */}
                  {activePaymentClientId === client.id && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200 shadow-inner space-y-4">
                      <form onClick={(e) => e.stopPropagation()}
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
                            onClick={(e) => { e.stopPropagation(); setActivePaymentClientId(null); }}
                            className="px-4 py-2 bg-gray-400 text-white rounded font-semibold hover:bg-gray-500 transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            onClick={(e) => { e.stopPropagation()}}
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
          </>
        )}
        </div>
      </main>
    </div>
  );
}