import Navbar from "@/components/Navbar";
import RightSideBar from "@/components/RightSideBar";
import Sidebar from "@/components/Sidebar";
import React, { ReactNode, useEffect, useState } from "react";
interface MainlayoutProps {
  children: ReactNode;
}
const Mainlayout = ({ children }: MainlayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, []);
  const handleslidein = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen((state) => !state);
    }
  };

  return (
    <div className="bg-[#f8f9fa] text-[#3a3a3a] min-h-screen">
      <Navbar handleslidein={handleslidein} />
      <div className="flex max-w-full py-1">
        <Sidebar isopen={sidebarOpen} />
        <main className="flex-1 min-w-0 p-4 lg:p-6 bg-white">{children}</main>
        <div className="hidden lg:block border-1 borde-gray-200">
          <RightSideBar />
        </div>
      </div>
    </div>
  );
};

export default Mainlayout;
