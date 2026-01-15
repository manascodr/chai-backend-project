import { Link, Outlet } from "react-router-dom";
import { logout } from "../../api/auth.api";
import { toast } from "react-toastify";
import { useAuthStore } from "../../stores/auth.store";

const AppLayout = () => {
  const clearUser = useAuthStore((s) => s.clearUser);

  const handleLogout = async () => {
    try {
      await logout();
      clearUser();
      toast.success("Logged out");
    } catch {
      toast.error("Error logging out");
    }
  };

  return (
    <div className="app-layout">

      {/* Topbar */}
      <header className="app-layout__topbar">
        <Link to="/" className="app-layout__brand">
          <span>▶</span> ChaiTube
        </Link>

        <button className="app-layout__logout" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* Body: Sidebar + Page Content */}
      <div className="app-layout__body">

        <aside className="app-layout__sidebar">
          <Link to="/" className="app-layout__link">Home</Link>
          <Link to="/history" className="app-layout__link">History</Link>
        </aside>

        <main className="app-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
