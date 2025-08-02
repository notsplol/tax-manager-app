import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Upload,
  FileText,
  Eye,
  Download,
  Trash2,
  Plus,
  User,
  ArrowLeft
} from 'lucide-react';
import { fetchClientById, fetchPaymentsByClientId } from '../api/clients';
import type { Client, Payment } from '../../../main/generated/prisma';

// Helpers
const formatDate = (date?: string | Date) =>
  date ? new Date(date).toLocaleDateString() : '—';

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
      <div className="min-h-screen flex items-center justify-center text-white text-xl">
        Loading client data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#272727] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        
        <h1 className="text-4xl font-bold flex items-center gap-3 mb-6">
          <a
            href="/clients"
            className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
          <ArrowLeft className="w-6 h-6 mr-1" />
          </a>
            <div className="w-16 h-16 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <User className="w-7 h-7"/>
            </div>
            {clientData.name}
        </h1>
        {/* Tabs UI */}
        <div className="bg-[#373737] backdrop-blur rounded-2xl shadow-xl border border-gray-700/50 ml-15">
          <div className="bg-gray-700 backdrop-blur rounded-2xl shadow-xl border border-gray-700/50">
          <div className="flex border-b border-gray-700/50 ml-3 mb-2">
            {['overview', 'documents', 'payments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'overview' | 'documents' | 'payments')}
                className={`px-6 py-4 text-sm font-medium capitalize transition-all ${
                  activeTab === tab
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-grey-900/10'
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-15">
                {/* Personal Info */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6">Personal Information</h3>
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
                      icon={<Mail className="w-4 h-4 text-gray-400" />}
                    />
                    <EditableField
                      label="Email"
                      value={clientData.email}
                      onChange={(v) => setClientData({ ...clientData, email: v })}
                      isEditing={isEditing}
                      icon={<Mail className="w-4 h-4" />}
                    />
                    <EditableField
                      label="Phone"
                      value={clientData.phone}
                      onChange={(v) => setClientData({ ...clientData, phone: v })}
                      isEditing={isEditing}
                      icon={<Phone className="w-4 h-4 text-gray-400" />}
                    />
                    <EditableField
                      label="Address"
                      value={clientData.email}
                      onChange={(v) => setClientData({ ...clientData, email: v })}
                      isEditing={isEditing}
                      multiline
                      icon={<MapPin className="w-4 h-4 text-gray-400 mt-1" />}
                    />
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6">Additional Details</h3>
                  <div className="space-y-4">
                    <EditableField
                      label="Industry"
                      value={clientData.email}
                      onChange={(v) => setClientData({ ...clientData, email: v })}
                      isEditing={isEditing}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Client Since</label>
                      <div className="flex items-center gap-2 text-white">
                        <Calendar className="w-4 h-4 text-gray-400" />
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
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Documents</h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all shadow-lg">
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </button>
                </div>
                <p className="text-gray-400">Document upload feature coming soon.</p>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Payment History</h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-all shadow-lg">
                    <Plus className="w-4 h-4" />
                    New Invoice
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700/50 border-b border-gray-600">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Invoice</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Amount</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Due Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Paid Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-700/30 transition">
                          <td className="px-6 py-4 font-mono text-sm text-gray-300">
                            {payment.status}
                          </td>
                          <td className="px-6 py-4 font-semibold text-white">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
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
      <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      {isEditing ? (
        multiline ? (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ) : (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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




