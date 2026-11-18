import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Route protection wrapper.
 * - Redirects unauthenticated users to /login preserving the requested path in location.state.
 * - Enforces role-based permissions; redirects unauthorized roles to /access-denied.
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-slate-300">
        <div className="w-10 h-10 rounded bg-navy-900 border border-navy-800 flex items-center justify-center font-display font-semibold text-cognac-200 text-sm animate-pulse mb-3">
          RS
        </div>
        <p className="text-xs text-slate-400 font-sans tracking-wide">
          Verifying session credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(currentUser?.role);
    if (!hasRole) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  return children ? children : <Outlet />;
}
