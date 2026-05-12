import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isAdminRole } from "../utils/roles";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (isAdminRole(user.role)) return <Navigate to="/admin" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
