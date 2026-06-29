import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import {
  Menu,
  User as UserIcon,
  LogOut,
  Settings,
  ChevronDown,
  Crown,
  UserPlus,
  Check,
  X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Assume these exist based on your instructions
import { getFriendRequests, acceptFriendRequest, rejectFriendRequest } from "@/lib/friendApi";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosinstance";

const Navbar = ({ handleslidein }: any) => {
  const { user, Logout, setUser } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // New Friend Request States
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [isFriendDropdownOpen, setIsFriendDropdownOpen] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const friendDropdownRef = useRef<HTMLDivElement>(null);

  const { translate } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Fetch Friend Requests
  const fetchRequests = async () => {
    if (!user?._id) return;
    try {
      setLoadingRequests(true);
      const res = await getFriendRequests(user._id);
      setFriendRequests(res.data || []);
    } catch (error) {
      console.log("Failed to fetch friend requests", error);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchRequests();
    }
  }, [user?._id]);

  // Click outside and ESC key handlers for Friend Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (friendDropdownRef.current && !friendDropdownRef.current.contains(event.target as Node)) {
        setIsFriendDropdownOpen(false);
      }
    };
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFriendDropdownOpen(false);
      }
    };

    if (isFriendDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isFriendDropdownOpen]);

  const handleAccept = async (senderId: string) => {
    if (!user?._id) return;

    try {
      await acceptFriendRequest(user._id, senderId);

      // Remove immediately from navbar
      setFriendRequests((prev) =>
        prev.filter((req) => req._id !== senderId)
      );

      toast.success(translate("Friend request accepted"));

      // Refresh after a short delay so backend is updated
      setTimeout(() => {
        fetchRequests();
      }, 300);

    } catch (error) {
      toast.error(translate("Failed to accept request"));
    }
    await fetchRequests();
    window.dispatchEvent(new Event("friend-updated"));
  };

  const handleReject = async (senderId: string) => {
    if (!user?._id) return;

    try {
      await rejectFriendRequest(user._id, senderId);

      // Remove immediately from navbar
      setFriendRequests((prev) =>
        prev.filter((req) => req._id !== senderId)
      );

      toast.success(translate("Friend request rejected"));

      // Refresh after backend update
      setTimeout(() => {
        fetchRequests();
      }, 300);

    } catch (error) {
      toast.error(translate("Failed to reject request"));
    }
  };

  const handlelogout = () => {
    Logout();
    setIsDropdownOpen(false);
  };

  const navLinks = [
    { name: translate("Feed"), path: "/feed" },
    { name: translate("Discussions"), path: "/" },
  ];

  const tickerItems = [
    ` 124 ${translate("Questions Asked Today")}`,
    ` 18 ${translate("Active Discussions")}`,
    ` ${translate("Welcome to YukithHub")}`,
  ];

  return (
    <>
      {/* Embedded CSS for the flawless infinite marquee and pause-on-hover */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .ticker-track {
          display: flex;
          width: max-content;
          animation: ticker 30s linear infinite;
        }
        .ticker-container:hover .ticker-track {
          animation-play-state: paused;
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />

      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#050505]/70 backdrop-blur-xl">
        {/* Subtle Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-50" />

        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-8 h-16 flex items-center justify-between gap-3">

          {/* LEFT SECTION: Logo & Mobile Menu */}
          <div className="flex items-center gap-4 min-w-max">
            <button
              aria-label="Toggle sidebar"
              className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-purple-400 hover:bg-white/5 rounded-xl transition-colors"
              onClick={handleslidein}
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-[0_0_15px_rgba(147,51,234,0.3)] group-hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all duration-300">
                <span className="text-white font-bold font-mono text-sm tracking-tighter">
                  Y
                </span>
              </div>
              <span className="font-semibold text-lg tracking-tight text-white hidden sm:block">
                Yukith<span className="text-purple-500/80">Hub</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-6">
              {navLinks.map((link) => {
                const isActive = router.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                        ? "text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-3 right-3 h-[2px] bg-purple-500 rounded-t-full shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* CENTER SECTION: Animated Ticker */}
          <div
            className="flex-1 max-w-2xl hidden md:flex items-center overflow-hidden relative ticker-container h-full"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
            }}
          >
            <div className="ticker-track flex items-center gap-12 cursor-default">
              {/* Duplicate the array to create a seamless infinite loop */}
              {[...tickerItems, ...tickerItems].map((item, index) => (
                <span
                  key={index}
                  className="text-sm font-medium text-gray-300/80 tracking-wide whitespace-nowrap hover:text-purple-400 transition-colors duration-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT SECTION: Notifications & Profile */}
          <div className="flex items-center justify-end gap-3 min-w-max relative">
            {!hasMounted ? (
              <div className="w-20 h-9 bg-white/5 animate-pulse rounded-lg" />
            ) : !user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-300 hover:text-white px-4 py-2 transition-colors"
                >
                  {translate("Log in")}
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium text-black bg-white hover:bg-gray-200 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] px-4 py-2 rounded-xl transition-all duration-300"
                >
                  {translate("Sign up")}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">

                {/* FRIEND REQUESTS SYSTEM */}
                <div className="relative" ref={friendDropdownRef}>
                  <button
                    aria-label="Friend Requests"
                    onClick={() => {
                      setIsFriendDropdownOpen(!isFriendDropdownOpen);
                      setIsDropdownOpen(false);
                    }}
                    className={`relative p-2 rounded-xl transition-all duration-200 ${isFriendDropdownOpen ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    <UserPlus className="w-5 h-5" />
                    {friendRequests.length > 0 && (
                      <span className="absolute 1 top-1.5 right-1.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                  </button>

                  {/* Friend Requests Dropdown */}
                  <AnimatePresence>
                    {isFriendDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-80 sm:w-[320px] bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                          <h3 className="text-sm font-semibold text-white">Friend Requests</h3>
                          <p className="text-xs text-gray-500">People waiting to connect</p>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                          {loadingRequests ? (
                            // Skeleton Loading
                            Array.from({ length: 3 }).map((_, i) => (
                              <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-white/5 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
                                <div className="flex-1 space-y-2">
                                  <div className="h-3 w-24 bg-white/10 rounded" />
                                  <div className="h-2 w-32 bg-white/5 rounded" />
                                </div>
                              </div>
                            ))
                          ) : friendRequests.length === 0 ? (
                            // Empty State
                            <div className="flex flex-col items-center justify-center py-8 text-center opacity-40">
                              <UserPlus className="w-10 h-10 mb-2 text-gray-400" />
                              <p className="text-sm font-medium text-white">No Friend Requests</p>
                              <p className="text-xs text-gray-400">You're all caught up.</p>
                            </div>
                          ) : (
                            // Request List
                            friendRequests.map((req) => (
                              <div key={req._id} className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 shadow-inner">
                                  <span className="text-white text-sm font-bold">
                                    {req.name?.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-200 truncate">{req.name}</p>
                                  <p className="text-xs text-gray-500 truncate">{req.email}</p>
                                </div>
                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleAccept(req._id)}
                                    className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                                    aria-label="Accept Request"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleReject(req._id)}
                                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                                    aria-label="Reject Request"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* PROFILE DROPDOWN */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(!isDropdownOpen);
                      setIsFriendDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 p-1 pl-2 pr-3 hover:bg-white/5 border border-transparent hover:border-purple-500/20 rounded-xl transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-[inset_0_1px_4px_rgba(255,255,255,0.3)]">
                      <span className="text-white text-xs font-bold font-mono">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute right-0 mt-2 w-56 bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(168,85,247,0.15)] z-50 overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                            <p className="text-sm font-medium text-white truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {user.email}
                            </p>
                          </div>

                          <div className="p-2">
                            <Link
                              href={`/users/${user._id}`}
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <UserIcon className="w-4 h-4 text-gray-500" />
                              {translate("Profile")}
                            </Link>

                            <Link
                              href={`/users/${user._id}`}
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <Settings className="w-4 h-4 text-gray-500" />
                              {translate("Settings")}
                            </Link>

                            {/* PREMIUM UPGRADE LINK */}
                            <Link
                              href="/subscription"
                              onClick={() => setIsDropdownOpen(false)}
                              className="group flex items-center justify-between px-3 py-2 mt-1 rounded-xl text-sm text-gray-300 hover:text-amber-400 hover:bg-yellow-500/10 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative flex items-center justify-center">
                                  <Crown className={`w-4 h-4 text-yellow-600/80 group-hover:text-yellow-400 transition-colors ${(!user.subscriptionPlan || user.subscriptionPlan === 'FREE') ? 'animate-pulse' : ''}`} />
                                  {(!user.subscriptionPlan || user.subscriptionPlan === 'FREE') && (
                                    <div className="absolute inset-0 bg-yellow-500/40 blur-md rounded-full" />
                                  )}
                                </div>
                                <span className="font-medium transition-colors">{translate("Upgrade")}</span>
                              </div>
                              <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${user.subscriptionPlan === 'GOLD' ? 'bg-gradient-to-r from-yellow-600/20 to-yellow-400/20 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]' :
                                  user.subscriptionPlan === 'SILVER' ? 'bg-gray-400/10 text-gray-400' :
                                    user.subscriptionPlan === 'BRONZE' ? 'bg-amber-700/10 text-amber-500' :
                                      'bg-white/10 text-gray-400'
                                }`}>
                                {user.subscriptionPlan || 'FREE'}
                              </div>
                            </Link>
                          </div>

                          <div className="p-2 border-t border-white/10">
                            <button
                              onClick={handlelogout}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              {translate("Log out")}
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;