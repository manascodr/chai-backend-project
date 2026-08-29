import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { logout } from "../../api/auth.api";
import { toast } from "react-toastify";
import { useAuthStore } from "../../stores/auth.store";
import {
  FiMenu,
  FiPlay,
  FiSearch,
  FiX,
  FiUpload,
  FiLogOut,
  FiUser,
} from "react-icons/fi";

/**
 * Navbar component for top navigation, search handling, and user actions.
 */
const Navbar = ({ onToggleMenu }) => {
  const clearUser = useAuthStore((s) => s.clearUser);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();

  const channelPath = user?.username ? `/c/${user.username}` : "/";

  // Initialize search value from URL query parameter
  const initialQuery = new URLSearchParams(location.search).get("q") || "";
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
   * Updates URL with search term
   */
  const navigateToSearch = (value) => {
    const q = value.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    navigate({
      pathname: "/",
      search: params.toString() ? `?${params.toString()}` : "",
    });
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

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5 bg-[#09090b]/90 backdrop-blur-2xl border-b border-white/[0.08] min-h-[64px]">
      {/* Left: Mobile Hamburger & Brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 text-lg transition-colors cursor-pointer"
          onClick={onToggleMenu}
          aria-label="Toggle sidebar menu"
        >
          <FiMenu />
        </button>

        <Link
          to="/"
          className="inline-flex items-center gap-2.5 no-underline group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-zinc-950 shadow-md shadow-amber-500/30 group-hover:scale-105 group-hover:shadow-amber-500/50 transition-all">
            <FiPlay className="text-base fill-current" />
          </div>
          <span className="text-white font-black text-xl tracking-tight">
            Vivid<span className="text-amber-400">Stream</span>
          </span>
        </Link>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-xl mx-2 hidden sm:block">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            navigateToSearch(searchValue);
          }}
          className="relative flex items-center w-full"
        >
          <FiSearch className="absolute left-4 text-zinc-500 text-base pointer-events-none" />
          <input
            className="w-full bg-[#121215] hover:bg-[#18181d] focus:bg-[#121215] text-zinc-100 placeholder-zinc-500 pl-11 pr-10 py-2.5 rounded-full border border-white/10 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-sm transition-all duration-200 outline-none"
            type="search"
            placeholder="Search videos, creators, playlists..."
            aria-label="Search videos"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {searchValue && (
            <button
              type="button"
              className="absolute right-3.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              onClick={() => {
                setSearchValue("");
                navigateToSearch("");
              }}
              aria-label="Clear search query"
            >
              <FiX className="text-base" />
            </button>
          )}
        </form>
      </div>

      {/* Right: Actions (Upload, Logout, Avatar) */}
      <div className="flex items-center gap-3">
        <Link
          to="/upload-video"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 hover:shadow-amber-500/40 transition-all no-underline"
        >
          <FiUpload className="text-sm sm:text-base text-zinc-950 font-bold" />
          <span>Create</span>
        </Link>

        <button
          onClick={handleLogout}
          title="Log out"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
        >
          <FiLogOut className="text-base" />
          <span>Logout</span>
        </button>

        <Link
          to={channelPath}
          aria-label="Your channel"
          title={`Logged in as ${user?.fullname || user?.username || "User"}`}
          className="w-9 h-9 rounded-full overflow-hidden border border-white/10 hover:border-amber-500 transition-all hover:scale-105 flex items-center justify-center bg-zinc-900 shrink-0"
        >
          {user?.avatar ? (
            <img
              className="w-full h-full object-cover"
              src={user.avatar}
              alt={user?.fullname || user?.username || "User"}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-amber-500 flex items-center justify-center text-zinc-950 text-sm font-bold">
              <FiUser />
            </div>
          )}
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
