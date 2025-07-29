import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ClientsPage from './pages/ClientsPage';
import PaymentsPage from './pages/PaymentsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientsPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
