import { useState } from "react";

type Props = {
  onAddClient: (client: NewClient) => void;
};

type NewClient = {
  name: string;
  email: string;
  phone: string;
};

export default function ClientForm({ onAddClient }: Props) {
  const [formData, setFormData] = useState<NewClient>({
    name: "",
    email: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddClient(formData);
    setFormData({ name: "", email: "", phone: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-x-4 space-y-4 p-4 bg-white rounded-lg shadow max-w-md mx-auto">
      <h2 className="text-xl font-semibold">Add New Client</h2>
      <input
        name="name"
        type="text"
        placeholder="Full Name"
        className="w-full p-2 border rounded"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        className="w-full p-2 border rounded"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        name="phone"
        type="tel"
        placeholder="Phone Number"
        className="w-full p-2 border rounded"
        value={formData.phone}
        onChange={handleChange}
        required
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Add New Client
      </button>
    </form>
  );
}