import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Newspaper,
  PlusCircle,
  Users,
  UserCircle,
  CreditCard,
  Settings
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { motion } from "framer-motion";

const Sidebar = ({ isopen, user }: any) => {
  const { translate } = useLanguage();
  const router = useRouter();

  const mainLinks = [
    { name: translate("Discussions"), path: "/", icon: <MessageSquare className="w-5 h-5" /> },
    { name: translate("Feed"), path: "/feed", icon: <Newspaper className="w-5 h-5" /> },
    { name: translate("Ask Question"), path: "/ask", icon: <PlusCircle className="w-5 h-5" /> },
    { name: translate("Community"), path: "/users", icon: <Users className="w-5 h-5" /> },
  ];

  const accountLinks = [
    { name: translate("Profile"), path: `/users/${user?._id || ''}`, icon: <UserCircle className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isopen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-16 lg:top-[64px] left-0 z-50 w-72 lg:w-64 h-[calc(100vh-64px)] overflow-y-auto bg-[#0A0A0A]/95 backdrop-blur-2xl border-r border-white/5 shadow-[4px_0_24px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-in-out",

          isopen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Subtle Side Glow */}
        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent" />

        <nav className="p-4 pb-24 space-y-8">

          {/* Main Navigation Group */}
          <div>
            <h4 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 font-mono">
              {translate("Main")}
            </h4>
            <ul className="space-y-1">
              {mainLinks.map((link) => {
                const isActive = router.pathname === link.path;
                return (
                  <li key={link.path} className="relative group">
                    {/* Active State Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="active-sidebar-indicator"
                        className="absolute left-0 top-1 bottom-1 w-[3px] bg-purple-500 rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}

                    <Link
                      href={link.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-purple-500/10 text-white"
                          : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                      )}
                    >
                      <span className={cn(
                        "transition-colors duration-200",
                        isActive ? "text-purple-400" : "text-gray-500 group-hover:text-gray-400"
                      )}>
                        {link.icon}
                      </span>
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Account Group (Only show if logged in) */}
          {user && (
            <div>
              <h4 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 font-mono">
                {translate("Account")}
              </h4>
              <ul className="space-y-1">
                {accountLinks.map((link) => {
                  const isActive = router.asPath === link.path;
                  return (
                    <li key={link.path} className="relative group">
                      {isActive && (
                        <motion.div
                          layoutId="active-sidebar-indicator"
                          className="absolute left-0 top-1 bottom-1 w-[3px] bg-purple-500 rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                          initial={false}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}

                      <Link
                        href={link.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-purple-500/10 text-white"
                            : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                        )}
                      >
                        <span className={cn(
                          "transition-colors duration-200",
                          isActive ? "text-purple-400" : "text-gray-500 group-hover:text-gray-400"
                        )}>
                          {link.icon}
                        </span>
                        {link.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Premium CTA Box */}
          <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border border-purple-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-colors" />
            <div className="relative z-10 flex items-start gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-white mb-1">
                  {translate("Need Help?")}
                </h5>
                <p className="text-xs text-gray-400 leading-relaxed mb-3">
                  {translate("Check out our community guidelines.")}
                </p>
                <Link href="/" className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                  {translate("Read Docs")} &rarr;
                </Link>
              </div>
            </div>
          </div>

        </nav>
      </aside>
    </>
  );
};

export default Sidebar;