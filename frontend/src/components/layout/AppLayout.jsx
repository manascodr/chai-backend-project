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
  FiSearch,
  FiX,
  FiPlay,
  FiUser,
  FiMenu
} from "react-icons/fi";

/**
 * AppLayout Component
 * 
 * Provides the persistent shell for authenticated users:
 * 1. Topbar: Sticky navigation with search, upload CTA, user profile, and logout.
 * 2. Sidebar: Organized into logical categories (Discover, Library, Creator Studio).
 * 3. Mobile Navigation: Responsive layout with horizontal scrolling tabs for smaller viewports.
 * 4. Footer: Clean site map and copyright details.
 */
const AppLayout = () => {
  const clearUser = useAuthStore((s) => s.clearUser);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();

  // Mobile sidebar drawer state (optional toggle for mobile viewports)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const channelPath = user?.username ? `/c/${user.username}` : "/";

  // Synchronize search input with the URL query parameter
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
      toast.info("Logged out successfully");
    } catch {
      toast.error("Error logging out");
    }
  };

  /**
   * Updates URL with the search term or removes it if cleared
   */
  const navigateToSearch = (value) => {
    const q = value.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    navigate({ pathname: "/", search: params.toString() ? `?${params.toString()}` : "" });
  };

  // Debounced live search when on the home page
  useEffect(() => {
    if (location.pathname !== "/") return;
    const timer = setTimeout(() => {
      navigateToSearch(searchValue);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, location.pathname]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-layout">
      {/* ================= TOPBAR NAVIGATION ================= */}
      <header className="app-layout__topbar">
        <div className="app-layout__topbarLeft">
          <button 
            type="button" 
            className="app-layout__mobileToggle" 
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle sidebar menu"
          >
            <FiMenu />
          </button>

          <Link to="/" className="app-layout__brand">
            <div className="app-layout__brandIcon">
              <FiPlay />
            </div>
            <span className="app-layout__brandText">Vivid<span>Stream</span></span>
          </Link>
        </div>

        {/* Search Bar with integrated Icon & Clear Button */}
        <div className="app-layout__topbarCenter">
          <form
            className="app-layout__search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              navigateToSearch(searchValue);
            }}
          >
            <FiSearch className="app-layout__searchIcon" aria-hidden="true" />
            <input
              className="app-layout__searchInput"
              type="search"
              placeholder="Search videos, creators, topics..."
              aria-label="Search videos"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            {searchValue && (
              <button
                type="button"
                className="app-layout__searchClear"
                onClick={() => {
                  setSearchValue("");
                  navigateToSearch("");
                }}
                aria-label="Clear search query"
              >
                <FiX />
              </button>
            )}
          </form>
        </div>

        {/* Topbar Actions */}
        <div className="app-layout__topbarRight">
          <Link to="/upload-video" className="app-layout__cta">
            <FiUpload className="app-layout__ctaIcon" />
            <span>Upload</span>
          </Link>

          <button className="app-layout__logout" onClick={handleLogout} title="Log out">
            <FiLogOut aria-hidden="true" />
            <span>Logout</span>
          </button>

          <Link
            to={channelPath}
            className="app-layout__avatarLink"
            aria-label="Your channel"
            title={`Logged in as ${user?.fullname || user?.username || "User"}`}
          >
            {user?.avatar ? (
              <img
                className="app-layout__avatar"
                src={user.avatar}
                alt={user?.fullname || user?.username || "User"}
                loading="lazy"
              />
            ) : (
              <div className="app-layout__avatar app-layout__avatar--placeholder">
                <FiUser />
              </div>
            )}
          </Link>
        </div>
      </header>

      {/* ================= MAIN BODY (SIDEBAR + CONTENT) ================= */}
      <div className="app-layout__body">
        <nav 
          className={`app-layout__sidebar ${mobileMenuOpen ? "app-layout__sidebar--mobile-open" : ""}`} 
          aria-label="Primary navigation"
        >
          {/* Section 1: Discover / Feeds */}
          <div className="app-layout__navSection">
            <span className="app-layout__navSectionTitle">Discover</span>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? "app-layout__link app-layout__link--active" : "app-layout__link"
              }
            >
              <FiHome className="app-layout__linkIcon" />
              <span>Home</span>
            </NavLink>

            <NavLink
              to="/tweets/feed"
              className={({ isActive }) =>
                isActive ? "app-layout__link app-layout__link--active" : "app-layout__link"
              }
            >
              <FiMessageSquare className="app-layout__linkIcon" />
              <span>Tweets Feed</span>
            </NavLink>
          </div>

          {/* Section 2: Library & Engagement */}
          <div className="app-layout__navSection">
            <span className="app-layout__navSectionTitle">Library</span>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                isActive ? "app-layout__link app-layout__link--active" : "app-layout__link"
              }
            >
              <FiClock className="app-layout__linkIcon" />
              <span>History</span>
            </NavLink>

            <NavLink
              to="/liked-videos"
              className={({ isActive }) =>
                isActive ? "app-layout__link app-layout__link--active" : "app-layout__link"
              }
            >
              <FiThumbsUp className="app-layout__linkIcon" />
              <span>Liked Videos</span>
            </NavLink>

            <NavLink
              to="/playlists"
              className={({ isActive }) =>
                isActive ? "app-layout__link app-layout__link--active" : "app-layout__link"
              }
            >
              <FiList className="app-layout__linkIcon" />
              <span>Playlists</span>
            </NavLink>
          </div>

          {/* Section 3: Creator Studio */}
          <div className="app-layout__navSection">
            <span className="app-layout__navSectionTitle">Creator Studio</span>
            <NavLink
              to="/upload-video"
              className={({ isActive }) =>
                isActive ? "app-layout__link app-layout__link--active" : "app-layout__link"
              }
            >
              <FiUpload className="app-layout__linkIcon" />
              <span>Upload Video</span>
            </NavLink>

            <NavLink
              to="/Dashboard"
              className={({ isActive }) =>
                isActive ? "app-layout__link app-layout__link--active" : "app-layout__link"
              }
            >
              <FiBarChart2 className="app-layout__linkIcon" />
              <span>Dashboard</span>
            </NavLink>
          </div>

          {/* Section 4: Settings & Channel (pinned to bottom) */}
          <div className="app-layout__navBottom">
            <NavLink
              to={channelPath}
              className={({ isActive }) =>
                isActive ? "app-layout__link app-layout__link--active" : "app-layout__link"
              }
            >
              <FiUser className="app-layout__linkIcon" />
              <span>Your Channel</span>
            </NavLink>

            <NavLink
              to="/profile-settings"
              className={({ isActive }) =>
                isActive ? "app-layout__link app-layout__link--active" : "app-layout__link"
              }
            >
              <FiSettings className="app-layout__linkIcon" />
              <span>Settings</span>
            </NavLink>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="app-layout__content">
          <Outlet />
        </main>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="app-layout__footer" aria-label="Site footer">
        <div className="app-layout__footerInner">
          <div className="app-layout__footerTop">
            <div className="app-layout__footerBrand">
              <Link to="/" className="app-layout__footerLogo">
                <div className="app-layout__brandIcon app-layout__brandIcon--sm">
                  <FiPlay />
                </div>
                <span>VividStream</span>
              </Link>
              <p className="app-layout__footerTagline">
                Watch, create, and share vibrant video content and community tweets in real time.
              </p>
            </div>

            <div className="app-layout__footerCols">
              <div className="app-layout__footerCol">
                <h4 className="app-layout__footerTitle">Explore</h4>
                <div className="app-layout__footerLinks">
                  <NavLink to="/" end className="app-layout__footerLink">Home Feed</NavLink>
                  <NavLink to="/playlists" className="app-layout__footerLink">Playlists</NavLink>
                  <NavLink to="/tweets/feed" className="app-layout__footerLink">Community Feed</NavLink>
                  <NavLink to="/liked-videos" className="app-layout__footerLink">Liked Videos</NavLink>
                  <NavLink to="/history" className="app-layout__footerLink">Watch History</NavLink>
                </div>
              </div>

              <div className="app-layout__footerCol">
                <h4 className="app-layout__footerTitle">Studio</h4>
                <div className="app-layout__footerLinks">
                  <NavLink to="/upload-video" className="app-layout__footerLink">Upload Content</NavLink>
                  <NavLink to="/Dashboard" className="app-layout__footerLink">Analytics & Videos</NavLink>
                  <NavLink to="/tweets" className="app-layout__footerLink">My Tweets</NavLink>
                </div>
              </div>

              <div className="app-layout__footerCol">
                <h4 className="app-layout__footerTitle">Account</h4>
                <div className="app-layout__footerLinks">
                  <NavLink to={channelPath} className="app-layout__footerLink">Your Channel</NavLink>
                  <NavLink to="/profile-settings" className="app-layout__footerLink">Settings & Security</NavLink>
                </div>
              </div>
            </div>
          </div>

          <div className="app-layout__footerBottom">
            <span className="app-layout__footerText">
              © {new Date().getFullYear()} VividStream. All rights reserved.
            </span>
            <span className="app-layout__footerText">Built with React & modern SCSS architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;

