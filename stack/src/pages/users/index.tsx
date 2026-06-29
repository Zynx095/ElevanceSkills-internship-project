import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { Calendar, Search, Users, Zap } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";

const getHighestBadge = (badges: string[] = []) => {
  if (badges.includes("Elite Contributor")) return "👑";
  if (badges.includes("Gold Contributor")) return "🥇";
  if (badges.includes("Silver Contributor")) return "🥈";
  if (badges.includes("Bronze Contributor")) return "🥉";
  return "";
};

const index = () => {
  const [users, setusers] = useState<any>(null);
  const [loading, setloading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { translate } = useLanguage();
  
  useEffect(() => {
    const fetchuser = async () => {
      try {
        const res = await axiosInstance.get("/user/getalluser");
        setusers(res.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchuser();
  }, []);

  if (loading) {
    return (
      <Mainlayout>
        <div className="flex min-h-[60vh] items-center justify-center bg-[#050505]">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </Mainlayout>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Mainlayout>
        <div className="text-center text-gray-400 mt-10 font-mono">
          {translate("No users found.")}
        </div>
      </Mainlayout>
    );
  }

  // Local filtering logic based on the search query
  const filteredUsers = users.filter((u: any) => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Mainlayout>
      <div className="relative min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-purple-500/30 pb-20">
        
        {/* Ambient Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vh] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="relative z-10 max-w-7xl mx-auto p-4 lg:p-8">
          
          {/* Hero Header Section */}
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end border-b border-white/5 pb-8 mb-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-medium tracking-wide uppercase">
                <Users className="w-3.5 h-3.5" />
                {translate("Directory")}
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                {translate("Users")}
              </h1>
              <p className="text-gray-400 text-lg">
                Connect with {users.length} developers in the community.
              </p>
            </div>

            <div className="w-full md:w-auto">
              <div className="relative w-full sm:w-72 group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative flex items-center bg-[#111] border border-white/10 rounded-xl px-3 py-2 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/50 transition-all">
                  <Search className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder={translate("Search developers...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-[#0A0A0A]/50">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400 font-mono">{translate("No users found.")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredUsers.map((user: any) => (
                <Link key={user._id} href={`/users/${user._id}`}>
                  <div className="relative bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:border-purple-500/30 hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)] transition-all duration-300 group overflow-hidden h-full flex flex-col">
                    
                    {/* Hover Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="flex items-start gap-4 mb-4 relative z-10">
                      <Avatar className="w-14 h-14 border-2 border-white/5 shadow-lg group-hover:border-purple-500/50 transition-colors">
                        <AvatarFallback className="text-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold">
                          {user.name.split(" ").map((n: any) => n[0]).join("").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 pt-1">
                        <h3 className="font-semibold text-gray-100 truncate flex items-center gap-1.5 group-hover:text-purple-400 transition-colors">
                          <span className="text-lg leading-none">{getHighestBadge(user.badges)}</span>
                          <span className="truncate">{user.name}</span>
                        </h3>
                        <p className="text-xs text-gray-500 truncate mt-0.5 font-mono">
                          @{user.name.toLowerCase().replace(/\s/g, "")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                      <div className="flex items-center text-xs text-gray-500 bg-white/5 px-2.5 py-1 rounded-md">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                        <span>{translate("Joined")} {new Date(user.joinDate).getFullYear()}</span>
                      </div>
                      
                      {/* Show Points if they exist, making the card look more gamified */}
                      {user.rewardPoints !== undefined && (
                        <div className="flex items-center text-xs font-mono font-bold text-yellow-500/80 bg-yellow-500/10 px-2.5 py-1 rounded-md">
                          <Zap className="w-3 h-3 mr-1 fill-yellow-500/80" />
                          {user.rewardPoints}
                        </div>
                      )}
                    </div>

                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Mainlayout>
  );
};

export default index;