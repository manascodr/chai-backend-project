import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { logout } from "../../api/auth.api";
import { toast } from "react-toastify";
import { useAuthStore } from "../../stores/auth.store";

const AppLayout = () => {
  const clearUser = useAuthStore((s) => s.clearUser);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();

  const initialQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("q") || "";
  }, [location.search]);

  const [searchValue, setSearchValue] = useState(initialQuery);

  useEffect(() => {
    setSearchValue(initialQuery);
  }, [initialQuery]);

  const handleLogout = async () => {
    try {
      await logout();
      clearUser();
    } catch {
      toast.error("Error logging out");
    }
  };

  const navigateToSearch = (value) => {
    const q = value.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    navigate({ pathname: "/", search: params.toString() ? `?${params.toString()}` : "" });
  };

  useEffect(() => {
    if (location.pathname !== "/") return;
    const t = setTimeout(() => {
      navigateToSearch(searchValue);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, location.pathname]);

  return (
    <div className="app-layout">

      {/* Topbar */}
      <header className="app-layout__topbar">
        <div className="app-layout__topbarLeft">
          <Link to="/" className="app-layout__brand">
            <span>▶</span> ChaiTube
          </Link>
        </div>

        <div className="app-layout__topbarCenter">
          <form
            className="app-layout__search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              navigateToSearch(searchValue);
            }}
          >
            <input
              className="app-layout__searchInput"
              type="search"
              placeholder="Search videos"
              aria-label="Search videos"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </form>
        </div>

        <div className="app-layout__topbarRight">
          <Link to="/upload-video" className="app-layout__cta">
            Upload
          </Link>

          <button className="app-layout__logout" onClick={handleLogout}>
            Logout
          </button>

          <Link
            to="/profile-settings"
            className="app-layout__avatarLink"
            aria-label="Open profile settings"
            title="Profile settings"
          >
            {user?.avatar ? (
              <img
                className="app-layout__avatar"
                src={user.avatar}
                alt={user?.fullname || user?.username || "User"}
                loading="lazy"
              />
            ) : (
              <div className="app-layout__avatar app-layout__avatar--placeholder" />
            )}
          </Link>
        </div>
      </header>

      {/* Body: Sidebar + Page Content */}
      <div className="app-layout__body">

        <nav className="app-layout__sidebar" aria-label="Primary">
          <NavLink to="/" end className={({ isActive }) =>
            isActive ? "app-layout__link app-layout__link--active" : "app-layout__link"
          }>Home</NavLink>
          <NavLink to="/history" className={({ isActive }) =>
            isActive ? "app-layout__link app-layout__link--active" : "app-layout__link"
          }>History</NavLink>
          <NavLink to="/liked-videos" className={({ isActive }) =>
            isActive ? "app-layout__link app-layout__link--active" : "app-layout__link"
          }>Liked Videos</NavLink>
          <NavLink to="/playlists" className={({ isActive }) =>
            isActive ? "app-layout__link app-layout__link--active" : "app-layout__link"
          }>Playlists</NavLink>
          <NavLink to="/tweets/feed" className={({ isActive }) =>
            isActive ? "app-layout__link app-layout__link--active" : "app-layout__link"
          }>Tweets</NavLink>
          <NavLink to="/upload-video" className={({ isActive }) =>
            isActive ? "app-layout__link app-layout__link--active" : "app-layout__link"
          }>Upload Video</NavLink>
          <NavLink to="/Dashboard" className={({ isActive }) =>
            isActive ? "app-layout__link app-layout__link--active" : "app-layout__link"
          }>Dashboard</NavLink>
        </nav>

        <main className="app-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
