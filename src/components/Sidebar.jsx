import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { navigation } from "../system";
import boyNinja from "../assets/boy-ninja.png";

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`fixed top-0 left-0 z-40 w-64 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 flex h-full`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center h-20 px-6 border-b border-gray-100/50">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Link to="/">
                <img src={boyNinja} alt="Boy Ninja Master of Content" />
              </Link>
            </div>
            <div className="ml-3">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Content Ninja
              </span>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setIsOpen(false)} // Close sidebar on mobile when navigating
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
    </div>
  );
};
