import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isAdminRole } from "../utils/roles";

 
const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="ad-global-loading">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (!isAdminRole(user.role)) return <Navigate to="/home" replace />;

  return <Outlet />;
};

export default AdminRoute;
