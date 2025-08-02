import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ClientsPage from './pages/ClientsPage';
import PaymentsPage from './pages/PaymentsPage';
import ClientPage from './pages/ClientPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientsPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/clients/:id" element={<ClientPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
