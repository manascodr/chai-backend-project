import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";

const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
