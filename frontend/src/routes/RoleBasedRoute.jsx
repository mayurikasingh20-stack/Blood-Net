import { Navigate } from "react-router-dom";
import useAuth from "../context/useAuth";

function RoleBasedRoute({ allowedRoles, children }) {
  const { user, token, loading, hasRole } = useAuth();

  if (loading) return <div aria-busy="true" className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-red border-t-transparent" /></div>;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.some(r => hasRole(r))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default RoleBasedRoute;
