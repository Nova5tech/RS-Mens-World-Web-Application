import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/layouts/AppShell';
import { ProtectedRoute } from '@/app/ProtectedRoute';
import { LoginPage } from '@/features/auth/LoginPage';

// Coming soon pages
import { ComingSoonPage } from '@/pages/ComingSoonPage';

// Feature pages
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ChatbotPage } from '@/features/chatbot/ChatbotPage';
import { LeadsPage } from '@/features/leads/LeadsPage';
import { CustomersPage } from '@/features/customers/CustomersPage';
import { CampaignsPage } from '@/features/campaigns/CampaignsPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { UsersBranchesPage } from '@/features/users/UsersBranchesPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes inside AppShell */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        {/* Operations */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/billing"
          element={<ComingSoonPage title="Billing (POS)" moduleName="Operations" />}
        />
        <Route
          path="/invoices"
          element={
            <ComingSoonPage title="Invoices & Returns" moduleName="Operations" />
          }
        />

        {/* Inventory */}
        <Route
          path="/stock-catalogue"
          element={
            <ComingSoonPage title="Stock & Catalogue" moduleName="Inventory" />
          }
        />
        <Route
          path="/stock-transfers"
          element={
            <ComingSoonPage title="Stock Transfers" moduleName="Inventory" />
          }
        />

        {/* Finance */}
        <Route
          path="/accounting"
          element={<ComingSoonPage title="Accounting" moduleName="Finance" />}
        />

        {/* Customer Engagement */}
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />

        {/* Insights & Control */}
        <Route path="/reports" element={<ReportsPage />} />

        {/* Admin-only Routes */}
        <Route
          path="/users-branches"
          element={
            <ProtectedRoute adminOnly>
              <UsersBranchesPage />
            </ProtectedRoute>
          }
        />
        {/* Support /users alias directly as admin-only route */}
        <Route
          path="/users"
          element={
            <ProtectedRoute adminOnly>
              <Navigate to="/users-branches" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute adminOnly>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};
