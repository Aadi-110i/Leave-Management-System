import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminPanel from './pages/AdminPanel';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1e1e1e',
                color: '#f0f0f0',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
                border: '1px solid #2a2a2a',
              },
              success: { iconTheme: { primary: '#4ade80', secondary: '#111111' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#111111' } },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route path="/employee" element={<RoleRoute allowedRoles={['employee']}><EmployeeDashboard /></RoleRoute>} />
              <Route path="/manager" element={<RoleRoute allowedRoles={['manager']}><ManagerDashboard /></RoleRoute>} />
              <Route path="/admin" element={<RoleRoute allowedRoles={['admin']}><AdminPanel /></RoleRoute>} />
              <Route path="/analytics" element={<RoleRoute allowedRoles={['manager', 'admin']}><AnalyticsDashboard /></RoleRoute>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
