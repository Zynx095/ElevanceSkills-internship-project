import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import axiosInstance from "@/lib/axiosinstance";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  MessageSquare,
  MessageCircle,
  TrendingUp,
  Award,
  Activity,
  Trophy,
  Zap,
  Hash,
  Star
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const RightSideBar = () => {
  const { user } = useAuth();
  const { translate } = useLanguage();
  const [mounted, setMounted] = useState(false);
  
  const [users, setUsers] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        const [uRes, qRes] = await Promise.all([
          axiosInstance.get("/user/getalluser"),
          axiosInstance.get("/question/getallquestion")
        ]);
        setUsers(uRes.data.data || []);
        setQuestions(qRes.data.data || []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  // Derived Statistics
  const totalAnswers = useMemo(() => questions.reduce((acc, q) => acc + (q.answer?.length || 0), 0), [questions]);
  
  const trendingTags = useMemo(() => {
    const counts: Record<string, number> = {};
    questions.forEach(q => q.questiontags?.forEach((t: string) => counts[t] = (counts[t] || 0) + 1));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(e => e[0]);
  }, [questions]);

  const topContributors = useMemo(() => 
    [...users].sort((a, b) => (b.rewardPoints || 0) - (a.rewardPoints || 0)).slice(0, 3)
  , [users]);

  const highestPointsUser = topContributors[0];
  const mostFriendsUser = useMemo(() => [...users].sort((a, b) => (b.friends?.length || 0) - (a.friends?.length || 0))[0], [users]);
  const recentActivity = useMemo(() => [...questions].sort((a, b) => new Date(b.askedon).getTime() - new Date(a.askedon).getTime()).slice(0, 3), [questions]);

  if (!mounted) return null;

  return (
    <aside className="w-full h-full p-4 lg:p-6 space-y-6 overflow-y-auto overflow-x-hidden relative">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-full h-64 bg-purple-900/10 blur-[80px] pointer-events-none" />

      {/* 1. Community Statistics */}
      <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          {translate("Platform Stats")}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#111] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center group transition-colors hover:border-indigo-500/30">
            <Users className="w-4 h-4 text-indigo-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-bold font-mono text-gray-200">{users.length}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{translate("Users")}</span>
          </div>
          <div className="bg-[#111] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center group transition-colors hover:border-purple-500/30">
            <MessageSquare className="w-4 h-4 text-purple-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-bold font-mono text-gray-200">{questions.length}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{translate("Topics")}</span>
          </div>
          <div className="col-span-2 bg-[#111] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center group transition-colors hover:border-pink-500/30">
            <MessageCircle className="w-4 h-4 text-pink-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-bold font-mono text-gray-200">{totalAnswers}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{translate("Total Answers")}</span>
          </div>
        </div>
      </div>

      {/* 2. Trending Tags */}
      {trendingTags.length > 0 && (
        <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 blur-2xl rounded-full" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            {translate("Trending")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag, i) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Badge className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-lg text-xs cursor-pointer transition-colors flex items-center gap-1 backdrop-blur-sm">
                  <Hash className="w-3 h-3 opacity-50" />
                  {tag}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Top Contributors */}
      {topContributors.length > 0 && (
        <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            {translate("Leaderboard")}
          </h3>
          <div className="space-y-3">
            {topContributors.map((u, index) => (
              <Link href={`/users/${u._id}`} key={u._id} className="flex items-center gap-3 group p-2 -mx-2 rounded-xl hover:bg-white/5 transition-colors">
                <div className="relative">
                  <Avatar className="w-9 h-9 border border-white/10">
                    <AvatarFallback className="text-xs bg-[#111] text-gray-300">
                      {u.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5 shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                      <Star className="w-2.5 h-2.5 text-black fill-black" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">{u.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{u.rewardPoints || 0} pts</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 4. Achievement Board */}
      <div className="bg-gradient-to-br from-[#0A0A0A]/90 to-purple-900/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-pink-400" />
          {translate("Hall of Fame")}
        </h3>
        <div className="space-y-4">
          {highestPointsUser && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{translate("Most Points")}</p>
                <p className="text-sm font-medium text-gray-200 truncate">{highestPointsUser.name}</p>
              </div>
            </div>
          )}
          {mostFriendsUser && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{translate("Most Connected")}</p>
                <p className="text-sm font-medium text-gray-200 truncate">{mostFriendsUser.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Live Activity Feed */}
      {recentActivity.length > 0 && (
        <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            {translate("Live Activity")}
          </h3>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:w-[1px] before:bg-gradient-to-b before:from-white/10 before:to-transparent">
            {recentActivity.map((activity, i) => (
              <div key={activity._id} className="relative flex gap-3 z-10">
                <div className="w-6 h-6 rounded-full bg-[#111] border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-300 leading-snug">
                    <span className="font-semibold text-gray-100">{activity.userposted}</span> asked a question
                  </p>
                  <Link href={`/questions/${activity._id}`} className="text-xs text-purple-400 hover:text-purple-300 truncate block mt-0.5 transition-colors">
                    {activity.questiontitle}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </aside>
  );
};

export default RightSideBar;