import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { useEffect } from "react";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);
  const location = useLocation();

  useEffect(() => {
    if (!user && isGuest) {
      toast.info("Please sign in to access this feature");
    }
  }, [user, isGuest, location.pathname]);

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;
