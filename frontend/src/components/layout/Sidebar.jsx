import { NavLink, useLocation } from "react-router-dom";
import { useEffect } from "react";
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
  FiUser,
} from "react-icons/fi";

const NAV_SECTIONS = [
  {
    title: "Discover",
    links: [
      { name: "Home", path: "/", icon: FiHome, end: true },
      { name: "Community", path: "/tweets/feed", icon: FiMessageSquare, end: true },
    ],
  },
  {
    title: "Library",
    links: [
      { name: "History", path: "/history", icon: FiClock, end: true },
      { name: "Liked Videos", path: "/liked-videos", icon: FiThumbsUp, end: true },
      { name: "Playlists", path: "/playlists", icon: FiList, end: true },
    ],
  },
  {
    title: "Creator Studio",
    links: [
      { name: "Upload Video", path: "/upload-video", icon: FiUpload, end: true },
      { name: "Dashboard", path: "/Dashboard", icon: FiBarChart2, end: true },
      { name: "My Posts", path: "/tweets", icon: FiMessageSquare, end: true },
    ],
  },
];

/**
 * Sidebar component with precise route matching (strictly single active item)
 * and monochrome titanium aesthetic.
 */
const Sidebar = ({ isOpen, onClose }) => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const channelPath = user?.username ? `/c/${user.username}` : null;

  // Auto-close mobile drawer whenever route changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const navLinkClass = ({ isActive }) =>
    `group relative flex items-center gap-3.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? "bg-white/[0.08] text-white border border-white/[0.12] shadow-xs"
        : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03] border border-transparent"
    }`;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 md:top-[64px] left-0 z-40 h-full md:h-[calc(100vh-64px)] w-56 shrink-0 bg-[#090a0d] border-r border-white/[0.07] p-3 flex flex-col justify-between overflow-y-auto transition-transform duration-200 md:transition-none ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        aria-label="Primary navigation"
      >
        <div className="flex flex-col gap-6 pt-1">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-1">
              <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-0.5 select-none">
                {section.title}
              </span>
              {section.links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.end}
                    className={navLinkClass}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`text-base shrink-0 transition-colors ${isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`} />
                        <span className="truncate">{link.name}</span>
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom: Settings & Channel Links */}
        <div className="flex flex-col gap-1 pt-3 border-t border-white/[0.07] mt-6">
          {channelPath && (
            <NavLink to={channelPath} end className={navLinkClass}>
              {({ isActive }) => (
                <>
                  <FiUser className={`text-base shrink-0 ${isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`} />
                  <span className="truncate">Your Channel</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                  )}
                </>
              )}
            </NavLink>
          )}
          <NavLink to="/profile-settings" end className={navLinkClass}>
            {({ isActive }) => (
              <>
                <FiSettings className={`text-base shrink-0 ${isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`} />
                <span className="truncate">Settings</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                )}
              </>
            )}
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

