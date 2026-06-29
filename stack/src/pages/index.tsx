import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { 
  Search, 
  Plus, 
  TrendingUp, 
  Clock, 
  MessageSquare, 
  ArrowUp, 
  Zap,
  HelpCircle,
  Hash
} from "lucide-react";

export default function Home() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"newest" | "top" | "unanswered">("newest");
  
  const router = useRouter();
  const { translate } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionRes, userRes] = await Promise.all([
          axiosInstance.get("/question/getallquestion"),
          axiosInstance.get("/user/getalluser")
        ]);
        setQuestions(questionRes.data.data || []);
        setUsers(userRes.data.data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derived Data: Trending Tags
  const trendingTags = useMemo(() => {
    if (!questions.length) return [];
    const counts: Record<string, number> = {};
    questions.forEach(q => {
      q.questiontags?.forEach((tag: string) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
  }, [questions]);

  // Derived Data: Filtered & Sorted Questions
  const filteredQuestions = useMemo(() => {
    let filtered = questions.filter(q => 
      q.questiontitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.questiontags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return filtered.sort((a, b) => {
      if (activeFilter === "newest") return new Date(b.askedon).getTime() - new Date(a.askedon).getTime();
      if (activeFilter === "top") return (b.upvote?.length || 0) - (a.upvote?.length || 0);
      if (activeFilter === "unanswered") return (a.answer?.length || 0) - (b.answer?.length || 0);
      return 0;
    });
  }, [questions, searchQuery, activeFilter]);

  const topUsers = [...users]
    .sort((a, b) => (b.rewardPoints || 0) - (a.rewardPoints || 0))
    .slice(0, 5);

  if (loading) {
    return (
      <Mainlayout>
        <div className="flex min-h-[60vh] items-center justify-center bg-[#050505]">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <div className="relative min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-purple-500/30">
        
        {/* Ambient Background Grid & Glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-[-10%] right-[10%] w-[40vw] h-[40vh] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto p-4 lg:p-8 space-y-8 z-10">
          
          {/* Hero Header Section */}
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end border-b border-white/5 pb-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-medium tracking-wide uppercase">
                <Zap className="w-3.5 h-3.5" />
                {translate("Developer Hub")}
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                {translate("Community Discussions")}
              </h1>
              <p className="text-gray-400 text-lg">
                {questions.length} {translate("Questions Available")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder={translate("Search discussions...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-600"
                />
              </div>
              <button
                onClick={() => router.push("/ask")}
                className="group relative flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap overflow-hidden"
              >
                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                {translate("Ask Question")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Filter Bar */}
              <div className="flex items-center gap-2 bg-[#0A0A0A]/80 backdrop-blur-md border border-white/5 p-1 rounded-xl w-max">
                {[
                  { id: "newest", label: translate("Newest"), icon: <Clock className="w-4 h-4" /> },
                  { id: "top", label: translate("Top Votes"), icon: <TrendingUp className="w-4 h-4" /> },
                  { id: "unanswered", label: translate("Unanswered"), icon: <HelpCircle className="w-4 h-4" /> }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeFilter === f.id 
                        ? "bg-white/10 text-white shadow-sm" 
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    {f.icon}
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Questions Feed */}
              <div className="space-y-4">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-[#0A0A0A]/50">
                    <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-400 font-mono">{translate("No questions match your criteria.")}</p>
                  </div>
                ) : (
                  filteredQuestions.map((q: any) => {
                    const upvotes = q.upvote?.length || 0;
                    const answers = q.answer?.length || 0;
                    const isAnswered = answers > 0;

                    return (
                      <div 
                        key={q._id} 
                        className="group relative bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden"
                      >
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <div className="flex flex-col sm:flex-row gap-5 relative z-10">
                          
                          {/* Metrics Column */}
                          <div className="flex sm:flex-col gap-4 sm:gap-3 shrink-0 sm:w-20">
                            <div className="flex items-center justify-center gap-1.5 bg-[#111] border border-white/5 rounded-lg py-1.5 px-3 sm:px-0">
                              <ArrowUp className={`w-3.5 h-3.5 ${upvotes > 0 ? 'text-purple-400' : 'text-gray-500'}`} />
                              <span className="font-mono text-sm font-semibold text-gray-300">{upvotes}</span>
                            </div>
                            <div className={`flex items-center justify-center gap-1.5 border rounded-lg py-1.5 px-3 sm:px-0 ${
                              isAnswered 
                                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                                : 'bg-[#111] border-white/5 text-gray-500'
                            }`}>
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span className="font-mono text-sm font-semibold">{answers}</span>
                            </div>
                          </div>

                          {/* Content Column */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <Link
                                href={`/questions/${q._id}`}
                                className="text-lg font-semibold text-gray-100 hover:text-purple-400 transition-colors line-clamp-1 mb-2"
                              >
                                {q.questiontitle}
                              </Link>
                              <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                                {q.questionbody}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
                              <div className="flex flex-wrap gap-2">
                                {q.questiontags?.map((tag: string) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-2.5 py-0.5 rounded-md text-xs transition-colors"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>

                              <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                                <Link href={`/users/${q.userid}`} className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
                                  <Avatar className="w-5 h-5 border border-white/10">
                                    <AvatarFallback className="text-[10px] bg-[#222] text-white">
                                      {q.userposted?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-gray-400">{q.userposted}</span>
                                </Link>
                                <span className="opacity-50">•</span>
                                <span>{new Date(q.askedon).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Trending Tags Widget */}
              {trendingTags.length > 0 && (
                <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    {translate("Trending Tags")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {trendingTags.map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors flex items-center gap-1"
                        onClick={() => setSearchQuery(tag)}
                      >
                        <Hash className="w-3 h-3 opacity-50" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Leaderboard Widget */}
              {topUsers.length > 0 && (
                <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    {translate("Top Contributors")}
                  </h3>
                  <div className="space-y-3">
                    {topUsers.map((u, index) => (
                      <div
                        key={u._id || index}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-mono font-bold w-4 text-center ${
                            index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-gray-600'
                          }`}>
                            #{index + 1}
                          </span>
                          <Avatar className="w-8 h-8 border border-white/10">
                            <AvatarFallback className="text-xs bg-[#111] text-gray-300">
                              {u.name?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm text-gray-300 group-hover:text-white transition-colors truncate max-w-[100px]">
                            {u.name}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md">
                          {u.rewardPoints || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </Mainlayout>
  );
}