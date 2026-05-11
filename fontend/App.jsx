import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import BorrowerDashboard from './pages/borrower/Dashboard';
import CreateLoan from './pages/borrower/CreateLoan';
import Marketplace from './pages/lender/Marketplace';

function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/borrower/dashboard" element={
            <PrivateRoute role="borrower"><BorrowerDashboard /></PrivateRoute>
          } />
          <Route path="/borrower/create-loan" element={
            <PrivateRoute role="borrower"><CreateLoan /></PrivateRoute>
          } />
          <Route path="/lender/marketplace" element={
            <PrivateRoute role="lender"><Marketplace /></PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
