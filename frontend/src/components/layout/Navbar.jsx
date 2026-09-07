import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
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
  FiCommand,
  FiLogIn,
} from "react-icons/fi";

/**
 * Navbar component for top navigation, search handling, and user actions.
 * Crafted with minimal studio aesthetic, keyboard shortcut (⌘K), and tactile micro-feel.
 */
const Navbar = ({ onToggleMenu }) => {
  const clearUser = useAuthStore((s) => s.clearUser);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);

  const channelPath = user?.username ? `/c/${user.username}` : "/";

  // Initialize search value from URL query parameter
  const initialQuery = new URLSearchParams(location.search).get("q") || "";
  const [searchValue, setSearchValue] = useState(initialQuery);

  useEffect(() => {
    setSearchValue(initialQuery);
  }, [initialQuery]);

  // Global keyboard shortcut for search focus (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      clearUser();
      toast.info("Signed out successfully");
    } catch {
      toast.error("Error signing out");
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
    }, 280);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, location.pathname]);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5 glass-nav min-h-[64px]">
      {/* Left: Mobile Hamburger & Brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] text-lg transition-colors cursor-pointer tactile-btn"
          onClick={onToggleMenu}
          aria-label="Toggle sidebar menu"
        >
          <FiMenu />
        </button>

        <Link
          to="/"
          className="inline-flex items-center gap-2.5 no-underline group select-none"
        >
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-zinc-950 shadow-xs group-hover:scale-105 transition-all duration-150">
            <FiPlay className="text-xs fill-current ml-0.5" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-white font-semibold text-base tracking-tight">
              Vivid<span className="text-zinc-400 font-normal ml-0.5">Stream</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Clean Minimal Search */}
      <div className="flex-1 max-w-xl mx-2 hidden sm:block">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            navigateToSearch(searchValue);
          }}
          className="relative flex items-center w-full"
        >
          <FiSearch className="absolute left-3.5 text-zinc-500 text-sm pointer-events-none" />
          <input
            ref={searchInputRef}
            className="w-full bg-[#111317] hover:bg-[#16181f] focus:bg-[#111317] text-zinc-100 placeholder-zinc-500 pl-10 pr-20 py-2 rounded-xl border border-white/[0.08] focus:border-white/30 focus:ring-1 focus:ring-white/10 text-sm transition-all duration-150 outline-none"
            type="search"
            placeholder="Search stories, creators, films..."
            aria-label="Search videos"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />

          <div className="absolute right-3 flex items-center gap-1.5 pointer-events-none">
            {searchValue ? (
              <button
                type="button"
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer pointer-events-auto p-1"
                onClick={() => {
                  setSearchValue("");
                  navigateToSearch("");
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear search query"
              >
                <FiX className="text-sm" />
              </button>
            ) : (
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-white/[0.05] border border-white/[0.08] rounded-md">
                <FiCommand className="text-[10px]" />K
              </kbd>
            )}
          </div>
        </form>
      </div>

      {/* Right: Actions (Upload, Logout/SignIn, Avatar) */}
      <div className="flex items-center gap-2.5">
        <Link
          to="/upload-video"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs sm:text-sm shadow-xs transition-all tactile-btn no-underline"
        >
          <FiUpload className="text-xs text-zinc-950 stroke-[2.5]" />
          <span>Upload</span>
        </Link>

        {user ? (
          <>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] text-xs sm:text-sm font-medium transition-colors cursor-pointer tactile-btn"
            >
              <FiLogOut className="text-sm" />
              <span>Logout</span>
            </button>

            <Link
              to={channelPath}
              aria-label="Your channel"
              title={`Profile: ${user?.fullname || user?.username || "Creator"}`}
              className="relative w-8 h-8 rounded-full overflow-hidden border border-white/[0.12] hover:border-white/40 transition-all hover:scale-105 flex items-center justify-center bg-zinc-900 shrink-0 shadow-xs"
            >
              {user?.avatar ? (
                <img
                  className="w-full h-full object-cover"
                  src={user.avatar}
                  alt={user?.fullname || user?.username || "User"}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-white/[0.08] text-zinc-300 flex items-center justify-center text-xs font-medium">
                  <FiUser />
                </div>
              )}
            </Link>
          </>
        ) : (
          <>
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold text-zinc-400 bg-white/[0.05] border border-white/[0.08] select-none">
              Guest
            </span>

            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all tactile-btn no-underline"
            >
              <FiLogIn className="text-sm stroke-[2.5]" />
              <span>Sign In</span>
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
