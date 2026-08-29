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
      { name: "Community", path: "/tweets/feed", icon: FiMessageSquare },
    ],
  },
  {
    title: "Library",
    links: [
      { name: "History", path: "/history", icon: FiClock },
      { name: "Liked Videos", path: "/liked-videos", icon: FiThumbsUp },
      { name: "Playlists", path: "/playlists", icon: FiList },
    ],
  },
  {
    title: "Creator Studio",
    links: [
      { name: "Upload Video", path: "/upload-video", icon: FiUpload },
      { name: "Dashboard", path: "/Dashboard", icon: FiBarChart2 },
      { name: "My Posts", path: "/tweets", icon: FiMessageSquare },
    ],
  },
];

/**
 * Sidebar component with categorized navigation links and responsive mobile drawer support.
 */
const Sidebar = ({ isOpen, onClose }) => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const channelPath = user?.username ? `/c/${user.username}` : "/";

  // Auto-close mobile drawer whenever route changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-4 px-3.5 py-2.5 rounded-xl border transition-colors duration-150 text-sm font-medium ${
      isActive
        ? "bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-sm shadow-amber-500/10"
        : "border-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
    }`;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 md:top-[64px] left-0 z-40 h-full md:h-[calc(100vh-64px)] w-60 shrink-0 bg-[#09090b] border-r border-white/[0.08] p-3 flex flex-col justify-between overflow-y-auto transition-transform duration-300 md:transition-none ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        aria-label="Primary navigation"
      >
        <div className="flex flex-col gap-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-1">
              <span className="px-3.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
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
                    <Icon className="text-lg shrink-0" />
                    <span>{link.name}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom: Settings & Channel Links */}
        <div className="flex flex-col gap-1 pt-4 border-t border-white/[0.08] mt-6">
          <NavLink to={channelPath} className={navLinkClass}>
            <FiUser className="text-lg shrink-0" />
            <span>Your Channel</span>
          </NavLink>
          <NavLink to="/profile-settings" className={navLinkClass}>
            <FiSettings className="text-lg shrink-0" />
            <span>Settings</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
