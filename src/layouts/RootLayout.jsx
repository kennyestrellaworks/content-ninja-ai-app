import { useEffect, useState } from "react";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { Sidebar } from "../components/Sidebar";
import { RxHamburgerMenu } from "react-icons/rx";
import { Outlet } from "react-router-dom";

export const RootLayout = () => {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-show sidebar on tablet/desktop, hide on mobile
  const shouldShowSidebar = isTablet || isDesktop;
  const isSidebarVisible = sidebarOpen || shouldShowSidebar;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar
        isVisible={isSidebarVisible}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
        isTablet={isTablet}
        setIsOpen={setSidebarOpen} // Fixed: pass setSidebarOpen instead of separate state
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300`}>
        {/* Mobile header with toggle */}
        {isMobile && (
          <div className="flex items-center justify-between px-4 py-3 bg-transparent">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 cursor-pointer transition-colors"
            >
              <RxHamburgerMenu className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex-1 p-6 md:p-10">
          <Outlet />
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {/* {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )} */}
    </div>
  );
};
