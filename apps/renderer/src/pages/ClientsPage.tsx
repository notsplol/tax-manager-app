import { useState } from "react";

type Client = {
  id: number;
  name: string;
  email: string;
  phone: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([
    { id: 1, name: "Jane Smith", email: "jane@example.com", phone: "555-987-6543" },
    { id: 2, name: "John Doe", email: "john@example.com", phone: "555-123-4567" },
  ]);

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });

  // Handlers for add form
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAddClient(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return alert("Please fill all fields");

    const newClient = {
      id: clients.length ? Math.max(...clients.map(c => c.id)) + 1 : 1,
      ...form,
    };
    setClients([...clients, newClient]);
    setForm({ name: "", email: "", phone: "" });
  }

  // Handlers for edit
  function startEdit(client: Client) {
    setEditingId(client.id);
    setEditForm({ name: client.name, email: client.email, phone: client.phone });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  function saveEdit(id: number) {
    if (!editForm.name || !editForm.email || !editForm.phone) return alert("Please fill all fields");

    setClients(clients.map(c => (c.id === id ? { id, ...editForm } : c)));
    setEditingId(null);
  }

  // Delete handler
  function deleteClient(id: number) {
    if (window.confirm("Are you sure you want to delete this client?")) {
      setClients(clients.filter(c => c.id !== id));
      if (editingId === id) setEditingId(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md mt-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Clients</h1>

      {/* Client list */}
      <div className="mb-10 space-y-4">
        {clients.map((client) => (
          <div
            key={client.id}
            className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-lg transition flex justify-between items-center"
          >
            {editingId === client.id ? (
              <div className="flex-1 space-y-2">
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="w-full px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Name"
                />
                <input
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  className="w-full px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Email"
                />
                <input
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className="w-full px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Phone"
                />
              </div>
            ) : (
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{client.name}</h3>
                <p className="text-gray-700 dark:text-gray-300">Email: {client.email}</p>
                <p className="text-gray-600 dark:text-gray-400">Phone: {client.phone}</p>
              </div>
            )}

            <div className="ml-4 flex gap-2">
              {editingId === client.id ? (
                <>
                  <button
                    onClick={() => saveEdit(client.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-400 text-white px-3 py-1 rounded-md hover:bg-gray-500 transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => startEdit(client)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
                    title="Edit Client"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteClient(client.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
                    title="Delete Client"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Client Form */}
      <form onSubmit={handleAddClient} className="space-y-5">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Add Client
        </button>
      </form>
    </div>
  );
}