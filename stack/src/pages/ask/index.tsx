import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import {
  Plus,
  X,
  Sparkles,
  Type,
  AlignLeft,
  Hash,
  Eye,
  Send,
  Lightbulb,
  AlertTriangle,
  Crown,
  Zap,
  ArrowRight,
  Infinity as InfinityIcon
} from "lucide-react";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useLanguage } from "@/lib/LanguageContext";

const AskQuestion = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { translate } = useLanguage();
  const [hasMounted, setHasMounted] = useState(false);
  interface QuestionStatus {
  plan: string;
  used: number;
  limit: number;
  remaining: number;
  unlimited: boolean;
}

  const [
    questionStatus,
    setQuestionStatus
  ] = useState<QuestionStatus | null>(null);

  // Subscription & Limits State
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const currentPlan =
  questionStatus?.plan ?? "FREE";

const isUnlimited =
  questionStatus?.unlimited ?? false;

const dailyLimit =
  isUnlimited
    ? Infinity
    : questionStatus?.limit ?? 1;

const questionsUsedToday =
  questionStatus?.used ?? 0;

const questionsRemaining =
  isUnlimited
    ? Infinity
    : questionStatus?.remaining ?? 0;

  const limitReached =
    !isUnlimited &&
    questionsRemaining <= 0;

  const progressPercentage =
    isUnlimited
      ? 100
      : (questionsUsedToday /
        dailyLimit) *
      100;
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState("");

  useEffect(() => {

    setHasMounted(true);

    if (user?._id) {

      fetchQuestionStatus();

    }

  }, [user]);


  // --- Handlers ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddTag = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    const trimmedTag = newTag.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");

    if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 5) {
      setFormData({ ...formData, tags: [...formData.tags, trimmedTag] });
      setNewTag("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(e);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag: string) => tag !== tagToRemove),
    });
  };
  const fetchQuestionStatus =
    async () => {

      try {

        const res =
          await axiosInstance.get(
            `/question/status/${user._id}`
          );
        console.log("QUESTION STATUS");
        console.log(res.data);

        setQuestionStatus(
          res.data
        );

      } catch (error) {

        console.log(error);

      }

    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(translate("Please log in to start a discussion."));
      router.push("/auth");
      return;
    }

    if (formData.title.length < 5) {
      toast.error(translate("Please provide a more descriptive title."));
      return;
    }

    try {
      const res = await axiosInstance.post("/question/ask", {
        postquestiondata: {
          questiontitle: formData.title,
          questionbody: formData.body,
          questiontags: formData.tags,
          userposted: user.name,
          userid: user?._id,
        },
      });
      if (res.data.data) {
        toast.success(translate("Discussion published successfully!"));
        await fetchQuestionStatus();

        toast.success(
          translate(
            "Discussion published successfully!"
          )
        );

        setFormData({
          title: "",
          body: "",
          tags: []
        });
      }
    } catch (error: any) {
      console.log(error);

      // SECTION 7: AUTO REDIRECT EXPERIENCE (Catching 403 Limit Reached)
      if (error.response?.status === 403) {
        setIsLimitModalOpen(true);
      } else {
        toast.error(translate("Something went wrong. Please try again."));
      }
    }
  };

  // Progress calculation for visual indicators
  const titleProgress = Math.min(100, (formData.title.length / 100) * 100);
  const bodyProgress = Math.min(100, (formData.body.length / 500) * 100);

  // Helper for Plan Colors
  const getPlanBadgeStyle = (plan: string) => {
    switch (plan) {
      case 'GOLD': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]';
      case 'SILVER': return 'bg-gray-300/10 text-gray-300 border-gray-400/30';
      case 'BRONZE': return 'bg-amber-700/10 text-amber-500 border-amber-700/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <Mainlayout>
      <div className="relative min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-purple-500/30 pb-20 overflow-x-hidden">

        {/* Ambient Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vh] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="relative z-10 max-w-7xl mx-auto p-4 lg:p-8">

          {/* Hero Section & Plan Badge */}
          <div className="mb-8 space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-medium tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                {translate("Create New")}
              </div>

              {/* SECTION 6: PLAN BADGE */}
              <Badge className={`px-3 py-1 text-xs font-mono font-bold tracking-widest uppercase border rounded-full ${getPlanBadgeStyle(currentPlan)}`}>
                {currentPlan} PLAN
              </Badge>
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              {translate("Start a Discussion")}
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              {translate("Share an idea, ask for help, or collaborate on a problem. The community is here to listen.")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* EDITOR COLUMN */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">

              {/* SECTION 3: LIMIT REACHED STATE (WARNING BANNER) */}
              {!isUnlimited && limitReached && (
                <div className="p-[1px] rounded-2xl bg-gradient-to-r from-red-500/50 to-orange-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="bg-[#0A0A0A] backdrop-blur-xl rounded-2xl p-5 flex items-start sm:items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-full shrink-0">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-red-400 font-bold text-lg">{translate("Question Limit Reached")}</h3>
                      <p className="text-gray-400 text-sm mt-1">
                        {translate("You have used all available questions for today. Upgrade your subscription plan to continue posting more questions.")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 1 & 2: QUESTION STATUS CARD & PROGRESS BAR */}
              <Card className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden relative shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500/50 via-indigo-500/50 to-transparent" />
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-6">
                    <div className="space-y-1">
                      <h3 className="text-gray-400 font-bold text-xs tracking-widest uppercase flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-400" /> Posting Status
                      </h3>
                      <div className="text-xl font-semibold text-white uppercase mt-1">
                        Current Plan: <span className={getPlanBadgeStyle(currentPlan).split(' ')[1]}>{currentPlan}</span>
                      </div>
                    </div>

                    {isUnlimited ? (
                      <div className="flex flex-col items-start sm:items-end justify-center">
                        <div className="inline-flex items-center gap-2 text-yellow-500 font-bold drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                          <InfinityIcon className="w-5 h-5" /> Unlimited Access Active
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-6 sm:gap-8">
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-xs uppercase tracking-wider mb-1">Used</span>
                          <span className="text-2xl font-bold text-white font-mono">{questionsUsedToday}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-xs uppercase tracking-wider mb-1">Remaining</span>
                          <span className={`text-2xl font-bold font-mono ${isUnlimited ? "Unlimited" : questionsRemaining === 0 ? "text-red-400" : "text-white"}`}>
                            {isUnlimited ? "Unlimited" : questionsRemaining}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-xs uppercase tracking-wider mb-1">Limit</span>
                          <span className="text-2xl font-bold text-gray-400 font-mono">{isUnlimited ? "Unlimited" : dailyLimit}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {!isUnlimited && (
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-400">Daily Progress</span>
                        <span className={limitReached ? "text-red-400" : "text-white"}>{questionsUsedToday} / {isUnlimited ? "Unlimited" : dailyLimit}</span>
                      </div>
                      <Progress
                        value={progressPercentage}
                        className={`h-2.5 bg-black border border-white/10 ${limitReached ? '[&>div]:bg-red-500 [&>div]:shadow-[0_0_10px_rgba(239,68,68,0.5)]' : '[&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-indigo-500 [&>div]:shadow-[0_0_10px_rgba(147,51,234,0.5)]'}`}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SECTION 5: UPGRADE CTA CARD (Shows only when limit reached) */}
              {limitReached && (
                <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 backdrop-blur-xl border border-indigo-500/30 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                  <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 justify-between">
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Crown className="w-6 h-6 text-yellow-500" /> Need More Questions?
                      </h3>
                      <p className="text-gray-300 text-sm max-w-md leading-relaxed">
                        Upgrade to Bronze, Silver, or Gold and unlock higher daily limits. Share more ideas with the community.
                      </p>
                      <div className="flex gap-3 pt-2 text-xs font-mono font-bold uppercase text-gray-400 flex-wrap">
                        <span className="bg-white/5 px-2 py-1 rounded">FREE → 1</span>
                        <span className="bg-amber-700/20 text-amber-500 px-2 py-1 rounded">BRONZE → 5</span>
                        <span className="bg-gray-400/20 text-gray-300 px-2 py-1 rounded">SILVER → 10</span>
                        <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">GOLD → ∞</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push("/subscription")}
                      className="shrink-0 w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl px-8 py-6 font-bold shadow-lg shadow-purple-900/50 transition-all hover:scale-105"
                    >
                      View Plans <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Form starts here */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card className={`bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 ${limitReached ? 'opacity-50 pointer-events-none grayscale-[0.2]' : ''}`}>
                  <div className="h-1 w-full bg-white/5 relative">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                      style={{ width: `${(titleProgress + bodyProgress) / 2}%` }}
                    />
                  </div>

                  <CardContent className="p-6 sm:p-8 space-y-8">
                    {/* Title Input */}
                    <div className="space-y-3 relative group">
                      <div className="flex justify-between items-end">
                        <Label htmlFor="title" className="text-base font-semibold flex items-center gap-2 text-gray-200">
                          <Type className="w-4 h-4 text-purple-400" />
                          {translate("Discussion Title")}
                        </Label>
                        <span className={`text-xs font-mono ${formData.title.length > 90 ? 'text-orange-400' : 'text-gray-500'}`}>
                          {formData.title.length} / 100
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {translate("Summarize your topic clearly and concisely.")}
                      </p>
                      <Input
                        id="title"
                        maxLength={100}
                        value={formData.title}
                        onChange={handleChange}
                        disabled={limitReached}
                        placeholder={translate("e.g. Best practices for structuring a scalable React application")}
                        className="w-full bg-[#111] border-white/10 text-white text-lg py-6 px-4 rounded-2xl focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 transition-all placeholder:text-gray-600"
                      />
                    </div>

                    {/* Body Input */}
                    <div className="space-y-3 relative group">
                      <div className="flex justify-between items-end">
                        <Label htmlFor="body" className="text-base font-semibold flex items-center gap-2 text-gray-200">
                          <AlignLeft className="w-4 h-4 text-indigo-400" />
                          {translate("Details & Context")}
                        </Label>
                        <span className="text-xs font-mono text-gray-500">
                          {formData.body.length} {translate("chars")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {translate("Provide background information, explain what you've tried, or elaborate on your idea.")}
                      </p>
                      <Textarea
                        id="body"
                        value={formData.body}
                        onChange={handleChange}
                        disabled={limitReached}
                        placeholder={translate("Write your thoughts here. Be as descriptive as possible...")}
                        className="w-full min-h-[250px] bg-[#111] border-white/10 text-white p-4 rounded-2xl focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 transition-all placeholder:text-gray-600 resize-y"
                      />
                    </div>

                    {/* Tags Input */}
                    <div className="space-y-3 relative group">
                      <div className="flex justify-between items-end">
                        <Label htmlFor="tags" className="text-base font-semibold flex items-center gap-2 text-gray-200">
                          <Hash className="w-4 h-4 text-pink-400" />
                          {translate("Topic Tags")}
                        </Label>
                        <span className="text-xs font-mono text-gray-500">
                          {formData.tags.length} / 5
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {translate("Categorize your discussion to help others find it.")}
                      </p>

                      <div className="flex gap-2 relative">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={handleKeyDown}
                          disabled={formData.tags.length >= 5 || limitReached}
                          placeholder={formData.tags.length >= 5 ? translate("Maximum tags reached") : translate("e.g. architecture, react, best-practices")}
                          className="w-full bg-[#111] border-white/10 text-white rounded-xl focus-visible:ring-pink-500/50 focus-visible:border-pink-500/50 transition-all placeholder:text-gray-600"
                        />
                        <Button
                          onClick={handleAddTag}
                          disabled={!newTag.trim() || formData.tags.length >= 5 || limitReached}
                          variant="outline"
                          type="button"
                          className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl shrink-0 transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Tag Badges */}
                      <div className="flex flex-wrap gap-2 pt-2 min-h-[32px]">
                        {formData.tags.map((tag: string) => (
                          <Badge
                            key={tag}
                            className="bg-pink-500/10 text-pink-300 border border-pink-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm transition-all hover:bg-pink-500/20"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              disabled={limitReached}
                              className="hover:text-white transition-colors disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </Badge>
                        ))}
                        {formData.tags.length === 0 && (
                          <span className="text-sm text-gray-600 italic">
                            {translate("No tags added yet.")}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* SECTION 4: REPLACE POST BUTTON */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500 hidden sm:block">
                    {limitReached
                      ? translate("You cannot post until you upgrade or wait until tomorrow.")
                      : translate("Make sure to review before publishing.")}
                  </span>

                  {limitReached ? (
                    <Button
                      type="button"
                      onClick={() => router.push("/subscription")}
                      className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl px-8 py-6 font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all animate-bounce-subtle"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      {translate("Upgrade To Continue")}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={formData.title.length < 1 || formData.body.length < 1}
                      className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl px-8 py-6 font-semibold shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {translate("Publish Discussion")}
                    </Button>
                  )}
                </div>
              </form>
            </div>

            {/* LIVE PREVIEW & GUIDELINES COLUMN */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24">

              {/* Live Preview Card */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 px-2">
                  <Eye className="w-4 h-4" /> {translate("Live Preview")}
                </h3>
                <Card className="bg-transparent border border-dashed border-white/20 rounded-3xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                  <CardContent className="p-6 relative z-10 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                        {hasMounted ? (user?.name?.charAt(0).toUpperCase() || "U") : "U"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-200">{hasMounted ? (user?.name || translate("You")) : translate("You")}</span>
                        <span className="text-xs text-gray-500">{translate("Just now")}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-white leading-snug break-words">
                        {formData.title || translate("Your discussion title will appear here...")}
                      </h4>
                    </div>

                    <p className="text-sm text-gray-400 line-clamp-4 break-words leading-relaxed">
                      {formData.body || translate("The details and context of your discussion will be displayed here for the community to read.")}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {formData.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="bg-white/10 text-gray-300 border-transparent text-xs rounded-md">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pro Tips Card */}
              <Card className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-3xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> {translate("Tips for Success")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      {translate("Write a title that summarizes the specific problem or idea.")}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      {translate("Provide enough context so others can understand without guessing.")}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      {translate("Use formatting to separate code, quotes, or important notes.")}
                    </li>
                  </ul>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>

      {/* SECTION 7: AUTO REDIRECT EXPERIENCE (403 LIMIT REACHED MODAL) */}
      <Dialog open={isLimitModalOpen} onOpenChange={setIsLimitModalOpen}>
        <DialogContent className="bg-[#0A0A0A] border border-white/10 text-white sm:max-w-md rounded-3xl">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              {translate("Question Limit Reached")}
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-center">
              {translate("You've hit the maximum number of questions allowed for your current subscription tier today.")}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 my-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{translate("Current Plan")}</span>
              <Badge className={getPlanBadgeStyle(currentPlan)}>{currentPlan}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{translate("Daily Limit")}</span>
              <span className="font-mono font-bold text-white">{isUnlimited ? "Unlimited" : dailyLimit} Questions</span>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              onClick={() => router.push("/subscription")}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl py-6 font-bold shadow-[0_0_15px_rgba(147,51,234,0.3)]"
            >
              <Crown className="w-4 h-4 mr-2" />
              {translate("Upgrade Subscription")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsLimitModalOpen(false)}
              className="w-full text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
            >
              {translate("Cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Mainlayout>
  );
};

export default AskQuestion;