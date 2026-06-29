import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  likePost,
  commentPost,
  sharePost,
  deletePost,
  createPost,
  getPosts
} from "@/lib/postApi";
import { useLanguage } from "@/lib/LanguageContext";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Trash2,
  Image as ImageIcon,
  Video,
  Send,
  ArrowLeft,
  MoreHorizontal,
  Loader2,
  Lock,
  Unlock,
  ShieldCheck,
  AlertTriangle // Updated to match the icon used in your JSX
} from "lucide-react";
import axiosInstance from "@/lib/axiosinstance";

const Feed = () => {
  // Added <any[]> and <any> to instantly clear the 'never' TypeScript errors
  const [posts, setPosts] = useState<any[]>([]);
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>({});

  // Connect directly to the new backend API state
  const [postStatus, setPostStatus] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const { translate } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPosts();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (currentUser._id) {
      fetchPostStatus();
    }
  }, [currentUser._id]);

  const fetchPostStatus = async () => {
    try {
      setStatusLoading(true);
      const res = await axiosInstance.get(`/post/status/${currentUser._id}`);
      setPostStatus(res.data);
    } catch (error) {
      console.error("Failed to load post status:", error);
    } finally {
      setStatusLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const data = await getPosts();
      // Adjust this based on what your API returns (data.data vs just data)
      setPosts(data.data || data);
    } catch (err) {
      console.log(err);
    }
  };

  const uploadToCloudinary = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "stackoverflow_media");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dx9onwwer/auto/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    setUploading(false);
    return data.secure_url;
  };

  // --- Backend-Driven Limit Calculations ---
  const friendCount = postStatus?.friends ?? 0;

  const isLocked = friendCount === 0;

  const isUnlimited =
    postStatus?.unlimited ?? false;

  const dailyLimit =
    isUnlimited
      ? Infinity
      : (postStatus?.limit ?? 0);

  const postsRemaining =
    isUnlimited
      ? Infinity
      : (postStatus?.remaining ?? 0);

  const limitReached =
    !isUnlimited &&
    postsRemaining <= 0;

  const handleCreate = async () => {
    if ((!caption && !mediaUrl) || limitReached || isLocked) return;

    await createPost({
      caption,
      mediaUrl,
      mediaType,
      userId: currentUser._id,
      userName: currentUser.name,
    });

    setCaption("");
    setMediaUrl("");

    // Refresh UI instantly without reloading page
    await loadPosts();
    await fetchPostStatus();
  };

  const handleLike = async (postId: string) => {
    await likePost(postId, currentUser._id);
    loadPosts();
  };

  const handleComment = async (postId: string) => {
    if (!commentText[postId]) return;

    await commentPost(postId, {
      userId: currentUser._id,
      userName: currentUser.name,
      comment: commentText[postId],
    });

    setCommentText({
      ...commentText,
      [postId]: "",
    });
    loadPosts();
  };

  const handleShare = async (postId: string) => {
    await sharePost(postId);
    loadPosts();
  };

  const handleDelete = async (postId: string) => {
    await deletePost(postId);
    loadPosts();
    await fetchPostStatus();
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-purple-500/30 pb-20">

      {/* Floating Ambient Background */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vh] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-2xl mx-auto p-4 pt-8">

        {/* Navigation */}
        <Link
          href="/"
          className="group inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all backdrop-blur-md border border-white/5"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {translate("Back to Discussions")}
        </Link>

        {/* PREMIUM STATUS CARD */}
        {postStatus && !statusLoading && (
          <Card className="mb-6 bg-gradient-to-br from-[#120B29]/80 to-[#0A0A0A]/90 backdrop-blur-2xl border border-purple-500/20 shadow-[0_0_30px_rgba(147,51,234,0.1)] rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between gap-6">

                {/* Status Column */}
                <div className="space-y-1">
                  <h3 className="text-purple-400/80 font-bold text-xs tracking-widest uppercase">Social Posting Status</h3>
                  <div className="flex items-center gap-2">
                    {isLocked ? (
                      <Lock className="w-5 h-5 text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]" />
                    ) : (
                      <Unlock className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                    )}
                    <span className="text-xl font-semibold text-white">
                      {isLocked ? "Locked" : "Active"}
                    </span>
                  </div>
                </div>

                {/* Metrics Grid (Responsive Statistics Strip) */}
                <div className="grid grid-cols-2 sm:flex gap-6 sm:gap-8">
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Friends</span>
                    <span className="text-2xl font-bold text-white">{friendCount}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Used Today</span>
                    <span className="text-2xl font-bold text-white">{postStatus?.used || 0}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Remaining</span>
                    <span className={`text-2xl font-bold ${limitReached ? "text-red-400" : "text-white"}`}>
                      {isUnlimited ? "Unlimited" : postsRemaining}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Daily Limit</span>
                    <span className="text-2xl font-bold text-white">
                      {isUnlimited ? "Unlimited" : dailyLimit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Progress Bar */}
              {!isUnlimited && !isLocked && (
                <div className="mt-6">
                  <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden border border-white/5 box-content">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${limitReached
                          ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                          : "bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_10px_rgba(147,51,234,0.5)]"
                        }`}
                      style={{
                        width: `${isUnlimited ? "Unlimited" : dailyLimit > 0 ? Math.min(((postStatus?.used || 0) / dailyLimit) * 100, 100) : 0}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Unlimited Badge */}
              {isUnlimited && (
                <div className="mt-6 text-sm text-indigo-300 font-medium flex items-center gap-2 bg-indigo-500/10 w-max px-3 py-1.5 rounded-full border border-indigo-500/20">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Unlimited Feed Posting Enabled
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 0 FRIENDS WARNING BANNER */}
        {isLocked && !statusLoading && (
          <div className="mb-6 bg-red-900/20 backdrop-blur-xl border border-red-500/30 rounded-2xl p-4 flex items-center gap-4 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <div className="p-2 bg-red-500/20 rounded-full shrink-0">
              <Lock className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h4 className="text-red-400 font-semibold text-sm flex items-center gap-2">
                {translate("Posting Locked")}
              </h4>
              <p className="text-red-300/80 text-xs mt-1">
                {translate("You need at least one friend before you can post publicly.")}
              </p>
            </div>
          </div>
        )}

        {/* LIMIT REACHED WARNING BANNER */}
        {limitReached && !isLocked && (
          <div className="mb-6 bg-orange-900/20 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-4 flex items-center gap-4 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
            <div className="p-2 bg-orange-500/20 rounded-full shrink-0">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h4 className="text-orange-400 font-semibold text-sm flex items-center gap-2">
                {translate("Daily Limit Reached")}
              </h4>
              <p className="text-orange-300/80 text-xs mt-1">
                {translate("You've reached today's posting limit. Add more friends to unlock additional daily posts.")}
              </p>
            </div>
          </div>
        )}

        {/* COMPOSER CARD */}
        <Card className={`mb-10 bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-3xl overflow-hidden transition-opacity ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
          <CardContent className="p-5 sm:p-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-inner">
                {currentUser.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <textarea
                  className="w-full bg-transparent text-white text-lg placeholder:text-gray-600 border-none outline-none resize-none min-h-[60px] pt-2"
                  placeholder={limitReached ? translate("You have reached your daily limit.") : translate("What's on your mind?")}
                  value={caption}
                  disabled={limitReached || isLocked}
                  onChange={(e) => setCaption(e.target.value)}
                />

                {/* Media Preview (if uploaded) */}
                {mediaUrl && (
                  <div className="relative mt-3 rounded-2xl overflow-hidden border border-white/10 bg-black/50">
                    {mediaType === "image" ? (
                      <img src={mediaUrl} alt="Preview" className="w-full max-h-[300px] object-cover" />
                    ) : (
                      <video src={mediaUrl} controls className="w-full max-h-[300px] object-cover" />
                    )}
                    <button
                      onClick={() => setMediaUrl("")}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-500/80 text-white rounded-full backdrop-blur-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*,video/*"
                      disabled={limitReached || isLocked}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = await uploadToCloudinary(file);
                        setMediaUrl(url);
                        setMediaType(file.type.startsWith("video") ? "video" : "image");
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={limitReached || isLocked}
                      onClick={() => fileInputRef.current?.click()}
                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-full px-4 h-9 disabled:opacity-50"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                      {uploading ? translate("Uploading...") : translate("add media")}
                    </Button>

                    {/* Minimal Media Type Fallback */}
                    <select
                      className="bg-transparent text-gray-500 text-xs font-medium outline-none cursor-pointer hover:text-gray-300 transition-colors disabled:opacity-50"
                      value={mediaType}
                      disabled={limitReached || isLocked}
                      onChange={(e) => setMediaType(e.target.value)}
                    >
                      <option className="bg-[#111]" value="image">{translate("Image")}</option>
                      <option className="bg-[#111]" value="video">{translate("Video")}</option>
                    </select>
                  </div>

                  <Button
                    disabled={uploading || (!caption && !mediaUrl) || limitReached || isLocked}
                    onClick={handleCreate}
                    className={`rounded-full px-6 h-9 font-semibold transition-all ${limitReached
                        ? "bg-red-500/20 text-red-400 border border-red-500/30 cursor-not-allowed hover:bg-red-500/20"
                        : "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)] disabled:opacity-50 disabled:shadow-none"
                      }`}
                  >
                    {limitReached ? translate("Daily Limit Reached") : translate("Post")}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FEED POSTS */}
        <div className="space-y-6">
          {posts.map((post: any) => (
            <Card
              key={post._id}
              className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-lg"
            >
              <CardHeader className="p-5 sm:p-6 pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-inner">
                      {post.userName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-100">{post.userName}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {currentUser._id === post.userId && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full h-8 w-8"
                      onClick={() => handleDelete(post._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 pt-4 space-y-4">

                {/* Caption */}
                {post.caption && (
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {post.caption}
                  </p>
                )}

                {/* Media Wrapper */}
                {post.mediaUrl && (
                  <div className="rounded-2xl overflow-hidden border border-white/5 bg-black group/media">
                    {post.mediaType === "image" ? (
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="w-full max-h-[600px] object-cover group-hover/media:scale-[1.02] transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <video
                        controls
                        src={post.mediaUrl}
                        className="w-full max-h-[600px] bg-black"
                      />
                    )}
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center gap-6 pt-2">
                  <button
                    onClick={() => handleLike(post._id)}
                    className="flex items-center gap-2 text-gray-400 hover:text-pink-500 transition-colors group/btn active:scale-95"
                  >
                    <div className="p-2 rounded-full group-hover/btn:bg-pink-500/10 transition-colors">
                      <Heart className={`w-5 h-5 ${post.likes.includes(currentUser._id) ? "fill-pink-500 text-pink-500" : ""}`} />
                    </div>
                    <span className="font-medium text-sm">{post.likes.length}</span>
                  </button>

                  <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors group/btn cursor-default">
                    <div className="p-2 rounded-full group-hover/btn:bg-blue-500/10 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-sm">{post.comments.length}</span>
                  </button>

                  <button
                    onClick={() => handleShare(post._id)}
                    className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors group/btn active:scale-95 ml-auto"
                  >
                    <div className="p-2 rounded-full group-hover/btn:bg-green-500/10 transition-colors">
                      <Repeat2 className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-sm">{post.shareCount}</span>
                  </button>
                </div>

                {/* Comments Section */}
                <div className="pt-4 border-t border-white/5 space-y-4">
                  {post.comments.length > 0 && (
                    <div className="space-y-3">
                      {post.comments.map((comment: any, index: number) => (
                        <div key={index} className="flex gap-3 group/comment">
                          <div className="w-7 h-7 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-300">
                            {comment.userName?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-sm px-4 py-2.5">
                            <span className="font-semibold text-sm text-gray-200 mr-2">
                              {comment.userName}
                            </span>
                            <span className="text-sm text-gray-400 break-words">
                              {comment.comment}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Input */}
                  <div className="flex gap-3 items-center mt-2">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-inner hidden sm:flex">
                      {currentUser.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 relative">
                      <Input
                        value={commentText[post._id] || ""}
                        placeholder={translate("Add a comment...")}
                        onChange={(e) =>
                          setCommentText({
                            ...commentText,
                            [post._id]: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleComment(post._id);
                        }}
                        className="w-full bg-[#111] border border-white/10 text-white rounded-full pr-10 focus-visible:ring-purple-500/50"
                      />
                      <button
                        onClick={() => handleComment(post._id)}
                        disabled={!commentText[post._id]}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-purple-500 hover:bg-purple-500/20 rounded-full disabled:opacity-50 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Feed;