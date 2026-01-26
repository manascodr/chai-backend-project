import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { logout } from "../../api/auth.api";
import { toast } from "react-toastify";
import { useAuthStore } from "../../stores/auth.store";
import {
  FiHome,
  FiClock,
  FiThumbsUp,
  FiList,
  FiMessageSquare,
  FiUpload,
  FiBarChart2,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

const AppLayout = () => {
  const clearUser = useAuthStore((s) => s.clearUser);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();

  const channelPath = user?.username ? `/c/${user.username}` : "/";

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
            <FiUpload aria-hidden="true" focusable="false" />
            <span>Upload</span>
          </Link>

          <button className="app-layout__logout" onClick={handleLogout}>
            <FiLogOut aria-hidden="true" focusable="false" />
            <span>Logout</span>
          </button>

          <Link
            to={channelPath}
            className="app-layout__avatarLink"
            aria-label="Open your channel"
            title="Your channel"
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
          <div className="app-layout__navGroup">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive
                  ? "app-layout__link app-layout__link--active"
                  : "app-layout__link"
              }
            >
              <FiHome className="app-layout__linkIcon" aria-hidden="true" focusable="false" />
              <span>Home</span>
            </NavLink>

            <NavLink
              to="/history"
              className={({ isActive }) =>
                isActive
                  ? "app-layout__link app-layout__link--active"
                  : "app-layout__link"
              }
            >
              <FiClock className="app-layout__linkIcon" aria-hidden="true" focusable="false" />
              <span>History</span>
            </NavLink>

            <NavLink
              to="/liked-videos"
              className={({ isActive }) =>
                isActive
                  ? "app-layout__link app-layout__link--active"
                  : "app-layout__link"
              }
            >
              <FiThumbsUp className="app-layout__linkIcon" aria-hidden="true" focusable="false" />
              <span>Liked Videos</span>
            </NavLink>

            <NavLink
              to="/playlists"
              className={({ isActive }) =>
                isActive
                  ? "app-layout__link app-layout__link--active"
                  : "app-layout__link"
              }
            >
              <FiList className="app-layout__linkIcon" aria-hidden="true" focusable="false" />
              <span>Playlists</span>
            </NavLink>

            <NavLink
              to="/tweets/feed"
              className={({ isActive }) =>
                isActive
                  ? "app-layout__link app-layout__link--active"
                  : "app-layout__link"
              }
            >
              <FiMessageSquare className="app-layout__linkIcon" aria-hidden="true" focusable="false" />
              <span>Tweets</span>
            </NavLink>

            <NavLink
              to="/upload-video"
              className={({ isActive }) =>
                isActive
                  ? "app-layout__link app-layout__link--active"
                  : "app-layout__link"
              }
            >
              <FiUpload className="app-layout__linkIcon" aria-hidden="true" focusable="false" />
              <span>Upload Video</span>
            </NavLink>

            <NavLink
              to="/Dashboard"
              className={({ isActive }) =>
                isActive
                  ? "app-layout__link app-layout__link--active"
                  : "app-layout__link"
              }
            >
              <FiBarChart2 className="app-layout__linkIcon" aria-hidden="true" focusable="false" />
              <span>Dashboard</span>
            </NavLink>
          </div>

          <div className="app-layout__navBottom">
            <NavLink
              to="/profile-settings"
              className={({ isActive }) =>
                isActive
                  ? "app-layout__link app-layout__link--active"
                  : "app-layout__link"
              }
            >
              <FiSettings className="app-layout__linkIcon" aria-hidden="true" focusable="false" />
              <span>Settings</span>
            </NavLink>
          </div>
        </nav>

        <main className="app-layout__content">
          <Outlet />
        </main>
      </div>

      <footer className="app-layout__footer" aria-label="Footer">
        <div className="app-layout__footerInner">
          <div className="app-layout__footerTop">
            <div className="app-layout__footerBrand">
              <Link to="/" className="app-layout__footerLogo">
                <span aria-hidden="true">▶</span>
                <span>ChaiTube</span>
              </Link>
              <p className="app-layout__footerTagline">
                Watch, upload, and manage your content — all in one place.
              </p>
            </div>

            <div className="app-layout__footerCols">
              <div className="app-layout__footerCol">
                <h4 className="app-layout__footerTitle">Explore</h4>
                <div className="app-layout__footerLinks">
                  <NavLink to="/" end className="app-layout__footerLink">
                    Home
                  </NavLink>
                  <NavLink to="/playlists" className="app-layout__footerLink">
                    Playlists
                  </NavLink>
                  <NavLink to="/tweets/feed" className="app-layout__footerLink">
                    Tweets
                  </NavLink>
                  <NavLink to="/liked-videos" className="app-layout__footerLink">
                    Liked Videos
                  </NavLink>
                  <NavLink to="/history" className="app-layout__footerLink">
                    History
                  </NavLink>
                </div>
              </div>

              <div className="app-layout__footerCol">
                <h4 className="app-layout__footerTitle">Creator</h4>
                <div className="app-layout__footerLinks">
                  <NavLink to="/upload-video" className="app-layout__footerLink">
                    Upload
                  </NavLink>
                  <NavLink to="/Dashboard" className="app-layout__footerLink">
                    Dashboard
                  </NavLink>
                </div>
              </div>

              <div className="app-layout__footerCol">
                <h4 className="app-layout__footerTitle">Account</h4>
                <div className="app-layout__footerLinks">
                  <NavLink to={channelPath} className="app-layout__footerLink">
                    Your Channel
                  </NavLink>
                  <NavLink to="/profile-settings" className="app-layout__footerLink">
                    Settings
                  </NavLink>
                </div>
              </div>
            </div>
          </div>

          <div className="app-layout__footerBottom">
            <span className="app-layout__footerText">
              © {new Date().getFullYear()} ChaiTube
            </span>
            <span className="app-layout__footerText">Built with React + Vite</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
