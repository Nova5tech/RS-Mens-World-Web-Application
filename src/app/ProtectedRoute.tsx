import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { useToast } from '@/contexts/ToastContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
}) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();
  const { showToast } = useToast();

  const isAccessDenied = isAuthenticated && adminOnly && role !== 'super_admin';

  useEffect(() => {
    if (isAccessDenied) {
      showToast("You don't have access", "error");
    }
  }, [isAccessDenied, showToast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-bg">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-3 border-primary-brand/30 border-t-primary-brand rounded-full animate-spin" />
          <span className="text-xs font-medium">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isAccessDenied) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
