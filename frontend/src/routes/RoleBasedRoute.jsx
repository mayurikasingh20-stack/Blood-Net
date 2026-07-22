import { Navigate } from "react-router-dom";
import useAuth from "../context/useAuth";
import LoadingPage from "../pages/LoadingPage";

function RoleBasedRoute({ allowedRoles, children }) {
  const { user, token, loading } = useAuth();

  if (loading) return <LoadingPage />;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default RoleBasedRoute;
