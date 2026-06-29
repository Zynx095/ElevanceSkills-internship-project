import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Clock,
  Flag,
  History,
  Share,
  Trash,
  MessageSquare,
  Eye,
  Info,
  ShieldAlert,
  HelpCircle,
  Inbox
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import axiosInstance from "@/lib/axiosinstance";
import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";

const questionData = {
  id: 3,
  title: "How can i block user with middleware?",
  content: `...`,
  votes: -4,
  answers: 2,
  views: 38,
  tags: ["node.js", "forms", "authentication", "next.js", "middleware"],
  author: {
    id: 3,
    name: "Aledi5",
    avatar: "A",
  },
  askedDate: "3 days ago",
  modifiedDate: "3 days ago",
  isBookmarked: false,
  userVote: null,
};

const answersData = [
  // Mock answers data preserved
];

// Motion variants for smooth animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

const QuestionDetail = ({ questionId }: any) => {
  const router = useRouter();
  const [question, setquestion] = useState<any>(null);
  const [answer, setanswer] = useState<any>();
  const [newanswer, setnewAnswer] = useState("");
  const [isSubmitting, setisSubmitting] = useState(false);
  const [loading, setloading] = useState(true);
  const { user } = useAuth();
  const { translate } = useLanguage();

  useEffect(() => {
    const fetchuser = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        const matchedquestion = res.data.data.find(
          (u: any) => u._id === questionId
        );
        setanswer(matchedquestion.answer);
        setquestion(matchedquestion);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchuser();
  }, [questionId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-10 w-10 border-t-2 border-b-2 border-purple-600 rounded-full"
        />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-gray-500 space-y-4">
        <HelpCircle className="w-12 h-12 text-gray-300" />
        <p className="text-lg font-medium">{translate("No question found.")}</p>
      </div>
    );
  }

  const handleVote = async (vote: String) => {
    if (!user) {
      toast.info(translate("Please login to continue"));
      router.push("/auth");
      return;
    }
    try {
      const res = await axiosInstance.patch(`/question/vote/${question._id}`, {
        value: vote,
        userid: user?._id,
      });
      if (res.data.data) {
        setquestion(res.data.data);
        toast.success(translate("Vote Updated"));
      }
    } catch (error) {
      console.error(error);
      toast.error(translate("Failed to Vote Post"));
    }
  };

  const handleAnswerVote = async (answerId: string, voteType: string) => {
    if (!user) {
      toast.info(translate("Please login to continue"));
      router.push("/auth");
      return;
    }
    try {
      await axiosInstance.patch(`/answer/vote/${question._id}`, {
        answerId,
        value: voteType,
      });

      setquestion((prev: any) => {
        const updatedAnswers = prev.answer.map((ans: any) => {
          if (ans._id === answerId) {
            return {
              ...ans,
              upvotes:
                voteType === "upvote"
                  ? (ans.upvotes || 0) + 1
                  : ans.upvotes || 0,
              downvotes:
                voteType === "downvote"
                  ? (ans.downvotes || 0) + 1
                  : ans.downvotes || 0,
            };
          }
          return ans;
        });
        return { ...prev, answer: updatedAnswers };
      });

      toast.success(translate("Answer vote updated"));
    } catch (error) {
      console.error(error);
      toast.error(translate("Failed to vote on answer"));
    }
  };

  const handlebookmark = () => {
    setquestion((prev: any) => ({ ...prev, isBookmarked: !prev.isBookmarked }));
  };

  const handleSubmitanswer = async () => {
    if (!user) {
      toast.info(translate("Please login to continue"));
      router.push("/auth");
      return;
    }
    if (!newanswer.trim()) return;
    setisSubmitting(true);
    try {
      const res = await axiosInstance.post(
        `/answer/postanswer/${question?._id}`,
        {
          noofanswer: question.noofanswer,
          answerbody: newanswer,
          useranswered: user.name,
          userid: user._id,
        }
      );
      if (res.data.data) {
        const newObj = {
          answerbody: newanswer,
          useranswered: user.name,
          userid: user._id,
          answeredon: new Date().toISOString(),
        };
        setquestion((prev: any) => ({
          ...prev,
          noofanswer: prev.noofanswer + 1,
          answer: [...(prev.answer || []), newObj],
        }));
        toast.success(translate("Answer Uploaded"));
      }
    } catch (error) {
      console.error(error);
      toast.error(translate("Failed to Answer"));
    } finally {
      setnewAnswer("");
      setisSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user) {
      toast.info(translate("Please login to continue"));
      router.push("/auth");
      return;
    }
    if (
      !window.confirm(
        translate("Are you sure you want to delete this question?")
      )
    )
      return;
    try {
      const res = await axiosInstance.delete(
        `/question/delete/${question._id}`
      );
      if (res.data.message) {
        toast.success(res.data.message);
        router.push("/");
      }
    } catch (error) {
      console.error(error);
      toast.error(translate("Failed to delete question"));
    }
  };

  const handleDeleteanswer = async (id: String) => {
    if (!user) {
      toast.info(translate("Please login to continue"));
      router.push("/auth");
      return;
    }
    if (
      !window.confirm(translate("Are you sure you want to delete this answer?"))
    )
      return;
    try {
      const res = await axiosInstance.delete(`/answer/delete/${question._id}`, {
        data: {
          noofanswer: question.noofanswer,
          answerid: id,
        },
      });
      if (res.data.data) {
        const updateanswer = question.answer.filter(
          (ans: any) => ans._id !== id
        );
        setquestion((prev: any) => ({
          ...prev,
          noofanswer: updateanswer.length,
          answer: updateanswer,
        }));
        toast.success(translate("deleted successfully"));
      }
    } catch (error) {
      console.error(error);
      toast.error(translate("Failed to delete question"));
    }
  };

  const totalVotes =
    (question?.upvote?.length || 0) - (question?.downvote?.length || 0);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Main Content (Left Column) */}
        <motion.main
          className="flex-1 w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Question Section */}
          <motion.div variants={itemVariants} className="mb-8 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
            <div className="relative bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl overflow-hidden">
              
              <div className="p-6 sm:p-8">
                {/* Header Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 ring-2 ring-purple-500/20">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-semibold">
                        {question.userposted?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link
                        href={`/users/${question.userid}`}
                        className="font-semibold text-gray-100 hover:text-purple-400 transition-colors"
                      >
                        {question.userposted}
                      </Link>
                      <div className="flex items-center text-xs text-gray-500 gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {translate("Asked")}{" "}
                          {new Date(question.askedon).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlebookmark}
                      className={`p-2.5 rounded-xl border transition-all ${
                        question?.isBookmarked
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                          : "bg-white/5 border-white/5 text-gray-400 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/10"
                      }`}
                    >
                      <Bookmark className="w-4 h-4" fill={question?.isBookmarked ? "currentColor" : "none"} />
                    </motion.button>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-6 leading-snug">
                  {question.questiontitle}
                </h1>

                <div className="flex flex-col sm:flex-row gap-6 lg:gap-8">
                  {/* Voting Column */}
                  <div className="flex sm:flex-col items-center gap-4 bg-black/40 p-2 sm:p-3 rounded-2xl h-fit border border-white/5">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleVote("upvote")}
                      className="p-2 rounded-xl text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                    >
                      <ChevronUp className="w-6 h-6" />
                    </motion.button>
                    <span className="font-semibold text-lg text-gray-100 w-8 text-center">
                      {totalVotes}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleVote("downvote")}
                      className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <ChevronDown className="w-6 h-6" />
                    </motion.button>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="prose prose-invert max-w-none prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-headings:font-semibold prose-a:text-purple-400">
                      <div
                        className="text-gray-300 leading-relaxed text-[15px]"
                        dangerouslySetInnerHTML={{
                          __html: question.questionbody
                            .replace(
                              /## (.*)/g,
                              '<h3 class="text-xl font-semibold mt-8 mb-4 text-white">$1</h3>'
                            )
                            .replace(
                              /```(\w+)?\n([\s\S]*?)```/g,
                              '<pre class="p-4 rounded-xl overflow-x-auto my-6 shadow-sm"><code class="text-sm font-mono">$2</code></pre>'
                            )
                            .replace(
                              /`([^`]+)`/g,
                              '<code class="bg-black/40 px-1.5 py-0.5 rounded-md text-sm font-mono text-purple-400">$1</code>'
                            )
                            .replace(/\n\n/g, '</p><p class="mb-5">')
                            .replace(/^/, '<p class="mb-5">')
                            .replace(/$/, "</p>")
                            .replace(
                              /\n(\d+\. .*)/g,
                              '<ol class="list-decimal list-inside my-5 space-y-2"><li>$1</li></ol>'
                            ),
                        }}
                      />
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-8">
                      {question.questiontags?.map((tag: string) => (
                        <Link key={tag} href={`/tags/${tag}`}>
                          <Badge className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/20 px-3 py-1 rounded-full text-xs font-medium transition-colors shadow-sm">
                            {tag}
                          </Badge>
                        </Link>
                      ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-white/5">
                      <div className="flex gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-white/5 rounded-lg h-9 px-3"
                        >
                          <Share className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">{translate("Share")}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-white/5 rounded-lg h-9 px-3"
                        >
                          <Flag className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">{translate("Report")}</span>
                        </Button>
                        {question.userid === user?._id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg h-9 px-3"
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">{translate("Delete")}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Answers Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
                {question.answer?.length || 0} {translate("Answer")}{(question.answer?.length !== 1) ? translate("s") : ""}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="space-y-5">
              <AnimatePresence>
                {(!question.answer || question.answer.length === 0) ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center p-12 text-center bg-[#0A0A0A]/40 backdrop-blur-sm border border-dashed border-white/10 rounded-2xl"
                  >
                    <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      No answers yet
                    </h3>
                    <p className="text-gray-500">
                      Be the first person to help the community.
                    </p>
                  </motion.div>
                ) : (
                  question.answer.map((ans: any, index: number) => (
                    <motion.div
                      key={ans._id}
                      variants={itemVariants}
                      layout
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="relative bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/5 shadow-sm rounded-2xl overflow-hidden group"
                    >
                      <div className="p-5 sm:p-7 flex flex-col sm:flex-row gap-5 lg:gap-7">
                        
                        {/* Answer Voting */}
                        <div className="flex sm:flex-col items-center gap-3 bg-black/40 p-2 sm:p-2.5 rounded-2xl h-fit border border-white/5">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleAnswerVote(ans._id, "upvote")}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                          >
                            <ChevronUp className="w-5 h-5" />
                          </motion.button>
                          <span className="font-semibold text-base text-gray-100 w-6 text-center">
                            {(ans.upvotes || 0) - (ans.downvotes || 0)}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleAnswerVote(ans._id, "downvote")}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <ChevronDown className="w-5 h-5" />
                          </motion.button>
                        </div>

                        {/* Answer Content */}
                        <div className="flex-1 min-w-0">
                          {/* Answer Author Header */}
                          <div className="flex items-center gap-3 mb-4">
                            <Avatar className="w-8 h-8 ring-2 ring-blue-500/20">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs font-semibold">
                                {ans.useranswered?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <Link
                                href={`/users/${ans.userid}`}
                                className="font-medium text-sm text-gray-100 hover:text-blue-400 transition-colors"
                              >
                                {ans.useranswered}
                              </Link>
                              <div className="text-xs text-gray-500">
                                {translate("answered")} {new Date(ans.answeredon).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            </div>
                            {ans.isAccepted && (
                              <Badge className="ml-auto bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Accepted Answer
                              </Badge>
                            )}
                          </div>

                          {/* Body */}
                          <div className="prose prose-invert max-w-none prose-sm sm:prose-base prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-a:text-purple-400 mb-6">
                            <div
                              className="text-gray-300 leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: ans.answerbody
                                  .replace(
                                    /## (.*)/g,
                                    '<h3 class="text-lg font-semibold mt-6 mb-3 text-white">$1</h3>'
                                  )
                                  .replace(
                                    /```(\w+)?\n([\s\S]*?)```/g,
                                    '<pre class="p-4 rounded-xl overflow-x-auto my-4 shadow-sm"><code class="text-sm font-mono">$2</code></pre>'
                                  )
                                  .replace(
                                    /`([^`]+)`/g,
                                    '<code class="bg-black/40 px-1.5 py-0.5 rounded-md text-sm font-mono text-purple-400">$1</code>'
                                  )
                                  .replace(/\n\n/g, '</p><p class="mb-4">')
                                  .replace(/^/, '<p class="mb-4">')
                                  .replace(/$/, "</p>")
                                  .replace(
                                    /\n(\d+\. .*)/g,
                                    '<ol class="list-decimal list-inside my-4 space-y-1"><li>$1</li></ol>'
                                  ),
                              }}
                            />
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 opacity-100 sm:opacity-60 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-400 hover:text-white hover:bg-white/5">
                              <Share className="w-3.5 h-3.5 mr-1.5" />
                              <span className="text-xs">{translate("Share")}</span>
                            </Button>
                            {ans.userid === user?._id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteanswer(ans._id)}
                                className="h-8 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                              >
                                <Trash className="w-3.5 h-3.5 mr-1.5" />
                                <span className="text-xs">{translate("Delete")}</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Answer Editor */}
          <motion.div variants={itemVariants}>
            <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl overflow-hidden p-6 sm:p-8 relative">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-80" />
              
              <h3 className="text-xl font-bold tracking-tight text-white mb-6">
                Write Your Answer
              </h3>
              
              <div className="relative mb-5 group">
                <Textarea
                  placeholder={translate("Share your knowledge... Use Markdown for formatting code, links, and lists.")}
                  value={newanswer}
                  onChange={(e) => setnewAnswer(e.target.value)}
                  className="min-h-[160px] resize-y bg-[#111] border-white/10 focus:ring-2 focus:ring-purple-500/50 rounded-xl p-4 text-[15px] transition-all text-white placeholder:text-gray-600"
                  disabled={isSubmitting}
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 px-2">
                    {newanswer.length} characters
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex w-full sm:w-auto gap-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-none">
                    <Button
                      onClick={handleSubmitanswer}
                      disabled={!newanswer.trim() || isSubmitting}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 shadow-[0_0_15px_rgba(147,51,234,0.3)] px-8 rounded-xl h-10 font-medium disabled:opacity-50 disabled:shadow-none"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          />
                          Posting...
                        </span>
                      ) : (
                        "Post Answer"
                      )}
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-none">
                    <Button
                      variant="outline"
                      onClick={() => setnewAnswer("")}
                      disabled={!newanswer || isSubmitting}
                      className="w-full rounded-xl h-10 border-white/10 bg-transparent text-gray-300 hover:text-white hover:bg-white/5"
                    >
                      Clear
                    </Button>
                  </motion.div>
                </div>
                
                <p className="text-xs text-gray-500 text-center sm:text-right max-w-[280px]">
                  By posting, you agree to our{" "}
                  <Link href="#" className="text-purple-400 hover:underline">Guidelines</Link> and{" "}
                  <Link href="#" className="text-purple-400 hover:underline">Terms</Link>.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.main>

        {/* Sidebar (Right Column) */}
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
          
          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 shadow-sm rounded-2xl p-6"
          >
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-500" />
              Question Stats
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <ChevronUp className="w-4 h-4" /> Score
                </div>
                <span className="font-semibold text-gray-100">{totalVotes}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <MessageSquare className="w-4 h-4" /> Answers
                </div>
                <span className="font-semibold text-gray-100">{question.noofanswer || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Eye className="w-4 h-4" /> Views
                </div>
                <span className="font-semibold text-gray-100">{question.views || 0}</span>
              </div>
            </div>
          </motion.div>

          {/* Guidelines Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 backdrop-blur-xl border border-indigo-500/10 shadow-sm rounded-2xl p-6"
          >
            <h4 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              Community Guidelines
            </h4>
            <ul className="text-sm text-indigo-200/70 space-y-3">
              <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" /> Be respectful and constructive.</li>
              <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" /> Share detailed, actionable code.</li>
              <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" /> Format your code blocks properly.</li>
            </ul>
          </motion.div>

          {/* Related Info Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 shadow-sm rounded-2xl p-6"
          >
             <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <Inbox className="w-4 h-4 text-purple-500" />
              Related Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {question.questiontags?.map((tag: string) => (
                <Link key={`sidebar-${tag}`} href={`/tags/${tag}`}>
                  <Badge className="bg-white/5 hover:bg-white/10 text-gray-300 border-none transition-colors">
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </motion.div>

        </aside>
      </div>
    </div>
  );
};

export default QuestionDetail;