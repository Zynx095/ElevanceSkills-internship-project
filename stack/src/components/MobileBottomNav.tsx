import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  House,
  Newspaper,
  CirclePlus,
  Users,
  User,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";

const MobileBottomNav = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { translate } = useLanguage();

  const links = [
    {
      name: translate("Home"),
      path: "/",
      icon: House,
    },
    {
      name: translate("Feed"),
      path: "/feed",
      icon: Newspaper,
    },
    {
      name: translate("Ask"),
      path: "/ask",
      icon: CirclePlus,
    },
    {
      name: translate("Users"),
      path: "/users",
      icon: Users,
    },
    {
      name: translate("Profile"),
      path: user ? `/users/${user._id}` : "/login",
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden">

      {/* Blur */}

      <div className="absolute inset-0 bg-[#050505]/90 backdrop-blur-2xl border-t border-white/10" />

      <div className="relative h-16 flex items-center justify-around">

        {links.map((item) => {

          const Icon = item.icon;

          const active =
            router.asPath === item.path ||
            (item.path !== "/" &&
              router.pathname.startsWith(item.path));

          return (

            <Link
              key={item.path}
              href={item.path}
              className="relative flex flex-col items-center justify-center w-full h-full"
            >

              {active && (

                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute top-0 h-1 w-10 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                  }}
                />

              )}

              <Icon
                className={`w-5 h-5 transition-all ${
                  active
                    ? "text-purple-400"
                    : "text-gray-500"
                }`}
              />

              <span
                className={`mt-1 text-[10px] font-medium transition-all ${
                  active
                    ? "text-white"
                    : "text-gray-500"
                }`}
              >
                {item.name}
              </span>

            </Link>

          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;