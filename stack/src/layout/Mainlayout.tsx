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
    // Ensures sidebar behaves correctly on resize
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    };
    
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleslidein = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen((state) => !state);
    }
  };

  return (
    // Unified Dark Surface with Typography and Selection Styling
    <div className="relative min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-purple-500/30 overflow-hidden">
      
      {/* 1. Ambient Background Glows */}
      <div className="absolute top-[-10%] right-[10%] w-[40vw] h-[40vh] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* 2. Subtle SaaS Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Navbar (Z-index ensures it sits above the background) */}
      <div className="relative z-50">
        <Navbar handleslidein={handleslidein} />
      </div>

      {/* Unified Workspace Container */}
      {/* h-[calc(100vh-64px)] assumes your navbar is roughly 64px tall, adjust if necessary */}
      <div className="relative z-10 flex max-w-[1440px] mx-auto h-[calc(100vh-64px)]">
        
        {/* Sidebar */}
        <Sidebar isopen={sidebarOpen} />
        
        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8 scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {children}
        </main>
        
        {/* Right Sidebar Wrapper */}
        {/* Replaced hard gray borders with border-white/5 and unified transparent background */}
        <div className="hidden xl:block w-80 border-l border-white/5 bg-transparent overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <RightSideBar />
        </div>
        
      </div>
      
      {/* Mobile Sidebar Overlay Blur */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={handleslidein}
        />
      )}
    </div>
  );
};

export default Mainlayout;