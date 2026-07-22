import { Navigate } from "react-router-dom";
import useAuth from "../context/useAuth";
import LoadingPage from "../pages/LoadingPage";

function ProtectedRoute({ children, requiredRole }) {
  const { user, token, loading } = useAuth();

  if (loading) return <LoadingPage />;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
