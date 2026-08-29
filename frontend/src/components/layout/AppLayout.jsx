import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

/**
 * AppLayout
 *
 * Shell layout coordinating top navigation, responsive sidebar drawer,
 * and main outlet canvas.
 */
const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans">
      {/* Top Navigation */}
      <Navbar onToggleMenu={() => setMobileMenuOpen((prev) => !prev)} />

      {/* Main Body: Sidebar + Page Content */}
      <div className="flex flex-1 min-h-[calc(100vh-64px)] relative">
        <Sidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <main className="flex-1 min-w-0 bg-[#09090b]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
