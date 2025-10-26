import { useEffect } from "react";
import { navigation } from "../system";
import { Link, NavLink } from "react-router-dom";
import boyNinja from "../assets/boy-ninja.png";
import { IoCloseSharp } from "react-icons/io5";

export const Sidebar = ({
  isVisible,
  onClose,
  isMobile,
  isTablet,
  setIsOpen = () => {},
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isMobile && isVisible) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isVisible, isMobile, onClose]);

  // Don't render if not visible on mobile
  if (isMobile && !isVisible) return null;

  const handleNavClick = () => {
    if (isMobile) {
      onClose();
      setIsOpen(false);
    }
  };

  return (
    <aside
      className={`
      bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl transition-all duration-300 ease-in-out
      ${
        isMobile
          ? `fixed top-0 left-0 h-full z-30 transform ${
              isVisible ? "translate-x-0" : "-translate-x-full"
            } w-64`
          : isTablet
          ? "w-48 min-w-[12rem]"
          : "w-64 min-w-[16rem]"
      }
    `}
    >
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="flex items-center justify-between h-20 px-4 sm:px-6 border-b border-gray-100/50">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
              <Link to="/" onClick={isMobile ? handleNavClick : undefined}>
                <img src={boyNinja} alt="Boy Ninja Master of Content" />
              </Link>
            </div>
            <div className="ml-3">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Content Ninja
              </span>
            </div>
          </div>

          {/* Close button on mobile - positioned on the right */}
          {isMobile && (
            <button
              onClick={() => {
                onClose();
                setIsOpen(false);
              }}
              aria-label="Close sidebar"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 cursor-pointer transition-colors"
            >
              <IoCloseSharp className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Sidebar content */}
        <nav className="flex-1 px-4 py-6 sm:py-8 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform scale-105"
                    : "text-gray-600 hover:bg-white/60 hover:text-gray-900 hover:shadow-md hover:scale-105"
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};
