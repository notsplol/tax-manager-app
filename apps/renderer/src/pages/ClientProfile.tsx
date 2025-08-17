import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Calendar, Upload, Plus, User, ArrowLeft } from 'lucide-react';
import { fetchClientById, fetchPaymentsByClientId } from '../api/clients';
import type { Client, Payment } from '../../../main/generated/prisma';

// Helpers
const formatDate = (date?: string | Date) => (date ? new Date(date).toLocaleDateString() : '—');

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'bg-green-700 text-white border-green-600';
    case 'pending':
      return 'bg-yellow-700 text-white border-yellow-600';
    case 'overdue':
      return 'bg-red-700 text-white border-red-600';
    default:
      return 'bg-gray-600 text-white border-gray-500';
  }
};

export default function ClientPage() {
  const { id } = useParams();
  const [clientData, setClientData] = useState<Client | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'payments'>('overview');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchClientById(Number(id)).then(setClientData);
      fetchPaymentsByClientId(Number(id)).then(setPayments);
    }
  }, [id]);

  if (!clientData) {
    return (
      <div className="flex min-h-screen items-center justify-center text-xl text-white">
        Loading client data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#272727] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 flex items-center gap-3 text-4xl font-bold">
          <a
            href="/clients"
            className="inline-flex items-center text-sm text-blue-400 transition-colors hover:text-blue-300"
          >
            <ArrowLeft className="mr-1 h-6 w-6" />
          </a>
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 shadow-lg transition-all duration-300 group-hover:shadow-xl">
            <User className="h-7 w-7" />
          </div>
          {clientData.name}
        </h1>
        {/* Tabs UI */}
        <div className="ml-15 rounded-2xl border border-gray-700/50 bg-[#373737] shadow-xl backdrop-blur">
          <div className="rounded-2xl border border-gray-700/50 bg-gray-700 shadow-xl backdrop-blur">
            <div className="mb-2 ml-3 flex border-b border-gray-700/50">
              {['overview', 'documents', 'payments'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as 'overview' | 'documents' | 'payments')}
                  className={`px-6 py-4 text-sm font-medium capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-grey-900/10 border-b-2 border-blue-400 text-blue-400'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 gap-15 lg:grid-cols-3">
                {/* Personal Info */}
                <div>
                  <h3 className="mb-6 text-xl font-semibold text-white">Personal Information</h3>
                  <div className="space-y-4">
                    <EditableField
                      label="Company Name"
                      value={clientData.email}
                      onChange={(v) => setClientData({ ...clientData, email: v })}
                      isEditing={isEditing}
                    />
                    <EditableField
                      label="Contact Person"
                      value={clientData.email}
                      onChange={(v) => setClientData({ ...clientData, email: v })}
                      isEditing={isEditing}
                      icon={<Mail className="h-4 w-4 text-gray-400" />}
                    />
                    <EditableField
                      label="Email"
                      value={clientData.email}
                      onChange={(v) => setClientData({ ...clientData, email: v })}
                      isEditing={isEditing}
                      icon={<Mail className="h-4 w-4" />}
                    />
                    <EditableField
                      label="Phone"
                      value={clientData.phone}
                      onChange={(v) => setClientData({ ...clientData, phone: v })}
                      isEditing={isEditing}
                      icon={<Phone className="h-4 w-4 text-gray-400" />}
                    />
                    <EditableField
                      label="Address"
                      value={clientData.email}
                      onChange={(v) => setClientData({ ...clientData, email: v })}
                      isEditing={isEditing}
                      multiline
                      icon={<MapPin className="mt-1 h-4 w-4 text-gray-400" />}
                    />
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <h3 className="mb-6 text-xl font-semibold text-white">Additional Details</h3>
                  <div className="space-y-4">
                    <EditableField
                      label="Industry"
                      value={clientData.email}
                      onChange={(v) => setClientData({ ...clientData, email: v })}
                      isEditing={isEditing}
                    />
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-400">
                        Client Since
                      </label>
                      <div className="flex items-center gap-2 text-white">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(clientData.email)}
                      </div>
                    </div>
                    <EditableField
                      label="Notes"
                      value={clientData.email}
                      onChange={(v) => setClientData({ ...clientData, email: v })}
                      isEditing={isEditing}
                      multiline
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Documents</h3>
                  <button className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-white shadow-lg transition-all hover:bg-blue-800">
                    <Upload className="h-4 w-4" />
                    Upload Document
                  </button>
                </div>
                <p className="text-gray-400">Document upload feature coming soon.</p>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Payment History</h3>
                  <button className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-white shadow-lg transition-all hover:bg-emerald-800">
                    <Plus className="h-4 w-4" />
                    New Invoice
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-600 bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">
                          Invoice
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">
                          Due Date
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">
                          Paid Date
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="transition hover:bg-gray-700/30">
                          <td className="px-6 py-4 font-mono text-sm text-gray-300">
                            {payment.status}
                          </td>
                          <td className="px-6 py-4 font-semibold text-white">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(payment.status)}`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-300">{formatDate(payment.status)}</td>
                          <td className="px-6 py-4 text-gray-300">{formatDate(payment.status)}</td>
                          <td className="px-6 py-4 text-gray-300">{payment.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable editable field component
function EditableField({
  label,
  value,
  onChange,
  isEditing,
  multiline = false,
  icon,
}: {
  label: string;
  value?: string | null;
  onChange: (v: string) => void;
  isEditing: boolean;
  multiline?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-400">{label}</label>
      {isEditing ? (
        multiline ? (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-gray-600 bg-gray-700/50 px-4 py-3 text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-xl border border-gray-600 bg-gray-700/50 px-4 py-3 text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        )
      ) : (
        <div className="flex items-start gap-2 text-white">
          {icon}
          <span>{value || '—'}</span>
        </div>
      )}
    </div>
  );
}
