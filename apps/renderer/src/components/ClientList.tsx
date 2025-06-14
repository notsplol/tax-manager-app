type Client = {
  name: string;
  email: string;
  phone: string;
};

type Props = {
  clients: Client[];
};

export default function ClientList({ clients }: Props) {
  if (clients.length === 0) {
    return <p className="text-center text-gray-500">No clients yet.</p>;
  }

  return (
    <div className="mt-6 max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold mb-2">Client List</h2>
      <ul className="divide-y divide-gray-200">
        {clients.map((client, index) => (
          <li key={index} className="py-2">
            <div className="font-medium">{client.name}</div>
            <div className="text-sm text-gray-600">{client.email} · {client.phone}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}