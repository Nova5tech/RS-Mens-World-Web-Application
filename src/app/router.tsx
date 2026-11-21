import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/layouts/AppShell';
import { ProtectedRoute } from '@/app/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Public Auth Page (eager)
import { LoginPage } from '@/features/auth/LoginPage';

// Lazy loaded feature pages for optimal bundle splitting and performance
const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const ChatbotPage = lazy(() =>
  import('@/features/chatbot/ChatbotPage').then((m) => ({ default: m.ChatbotPage }))
);
const LeadsPage = lazy(() =>
  import('@/features/leads/LeadsPage').then((m) => ({ default: m.LeadsPage }))
);
const CustomersPage = lazy(() =>
  import('@/features/customers/CustomersPage').then((m) => ({ default: m.CustomersPage }))
);
const ContentLibraryPage = lazy(() =>
  import('@/features/content/ContentLibraryPage').then((m) => ({ default: m.ContentLibraryPage }))
);
const CampaignsPage = lazy(() =>
  import('@/features/campaigns/CampaignsPage').then((m) => ({ default: m.CampaignsPage }))
);
const ReportsPage = lazy(() =>
  import('@/features/reports/ReportsPage').then((m) => ({ default: m.ReportsPage }))
);
const UsersBranchesPage = lazy(() =>
  import('@/features/users/UsersBranchesPage').then((m) => ({ default: m.UsersBranchesPage }))
);
const SettingsPage = lazy(() =>
  import('@/features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const AuditLogPage = lazy(() =>
  import('@/features/settings/AuditLogPage').then((m) => ({ default: m.AuditLogPage }))
);

// Coming soon & 404 pages
const ComingSoonPage = lazy(() =>
  import('@/pages/ComingSoonPage').then((m) => ({ default: m.ComingSoonPage }))
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 border-3 border-[#0F4C3A] border-t-transparent rounded-full animate-spin" />
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
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
              element={<ComingSoonPage title="Invoices & Returns" moduleName="Operations" />}
            />

            {/* Inventory */}
            <Route
              path="/stock-catalogue"
              element={<ComingSoonPage title="Stock & Catalogue" moduleName="Inventory" />}
            />
            <Route
              path="/stock-transfers"
              element={<ComingSoonPage title="Stock Transfers" moduleName="Inventory" />}
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
            <Route
              path="/content"
              element={
                <ProtectedRoute adminOnly>
                  <ContentLibraryPage />
                </ProtectedRoute>
              }
            />

            {/* Insights & Control */}
            <Route path="/reports" element={<ReportsPage />} />

            {/* Admin-only Routes */}
            <Route
              path="/users"
              element={
                <ProtectedRoute adminOnly>
                  <UsersBranchesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users-branches"
              element={
                <ProtectedRoute adminOnly>
                  <UsersBranchesPage />
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
            <Route
              path="/settings/audit"
              element={
                <ProtectedRoute adminOnly>
                  <AuditLogPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route inside shell */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};
