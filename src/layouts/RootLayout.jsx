import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";

export const RootLayout = () => {
  return (
    <div className="flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar />
      <main className="flex-1 ml-64 w-full min-h-screen md:ml-64">
        <div className="p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
