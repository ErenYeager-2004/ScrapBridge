import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';

import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

// Public pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import VerifyEmail from './pages/public/VerifyEmail';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import Unauthorized from './pages/public/Unauthorized';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AllRequests from './pages/admin/AllRequests';
import AdminRequestDetail from './pages/admin/RequestDetail';

// Home User pages
import UserDashboard from './pages/homeuser/UserDashboard';
import NewRequest from './pages/homeuser/NewRequest';
import RequestHistory from './pages/homeuser/RequestHistory';
import UserRequestDetail from './pages/homeuser/RequestDetail';

// Collector pages
import CollectorDashboard from './pages/collector/CollectorDashboard';
import AssignedPickups from './pages/collector/AssignedPickups';
import PickupDetail from './pages/collector/PickupDetail';

// Buyer pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';

export default function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #374151',
              },
            }}
          />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected — ADMIN */}
            <Route element={<ProtectedRoute />}>
              <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<DashboardLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="requests" element={<AllRequests />} />
                  <Route path="requests/:id" element={<AdminRequestDetail />} />
                </Route>
              </Route>
            </Route>

            {/* Protected — HOME_USER */}
            <Route element={<ProtectedRoute />}>
              <Route element={<RoleRoute allowedRoles={['HOME_USER']} />}>
                <Route path="/user" element={<DashboardLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<UserDashboard />} />
                  <Route path="new-request" element={<NewRequest />} />
                  <Route path="requests" element={<RequestHistory />} />
                  <Route path="requests/:id" element={<UserRequestDetail />} />
                </Route>
              </Route>
            </Route>

            {/* Protected — COLLECTOR */}
            <Route element={<ProtectedRoute />}>
              <Route element={<RoleRoute allowedRoles={['COLLECTOR']} />}>
                <Route path="/collector" element={<DashboardLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<CollectorDashboard />} />
                  <Route path="pickups" element={<AssignedPickups />} />
                  <Route path="pickups/:id" element={<PickupDetail />} />
                </Route>
              </Route>
            </Route>

            {/* Protected — BUYER */}
            <Route element={<ProtectedRoute />}>
              <Route element={<RoleRoute allowedRoles={['BUYER']} />}>
                <Route path="/buyer" element={<DashboardLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<BuyerDashboard />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </DarkModeProvider>
  );
}
