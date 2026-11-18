import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ROLES } from './context/AuthContext.jsx';
import { BranchProvider } from './context/BranchContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import AppLayout from './app/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AccessDeniedPage from './pages/AccessDeniedPage.jsx';
import OverviewPage from './pages/OverviewPage.jsx';
import ChatInboxPage from './pages/ChatInboxPage.jsx';
import LeadsPage from './pages/LeadsPage.jsx';
import CustomersPage from './pages/CustomersPage.jsx';
import CampaignsPage from './pages/CampaignsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <BranchProvider>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/access-denied" element={<AccessDeniedPage />} />

              {/* Protected Store Operations Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<OverviewPage />} />
                <Route path="chat-inbox" element={<ChatInboxPage />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="campaigns" element={<CampaignsPage />} />
                <Route path="reports" element={<ReportsPage />} />

                {/* Administrative Store Settings: Super Admin Only */}
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BranchProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
