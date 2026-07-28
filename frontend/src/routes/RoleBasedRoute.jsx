import { Navigate } from "react-router-dom";
import useAuth from "../context/useAuth";
import LoadingPage from "../pages/LoadingPage";

function RoleBasedRoute({ allowedRoles, children }) {
  const { user, token, loading, hasRole } = useAuth();

  if (loading) return <LoadingPage />;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.some(r => hasRole(r))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default RoleBasedRoute;
