import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
} from "@/lib/friendApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import {
  Calendar,
  Edit,
  Plus,
  X,
  Zap,
  Users,
  MessageSquare,
  MessageCircle,
  Clock,
  Shield,
  Award,
  CreditCard,
  ArrowRightLeft,
  CheckCircle2,
  Search,
  CheckCircle,
  Clock3,
  UserCheck,
  UserX,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Chrome
} from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useLanguage } from "@/lib/LanguageContext";
import {
  sendMobileOTP,
  verifyMobileOTP
} from "@/lib/phoneApi";

const index = () => {
  const { user } = useAuth();
  const { translate } = useLanguage();
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const router = useRouter();
  const { id } = router.query;


  const [users, setusers] = useState<any>(null);
  const [loading, setloading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: users?.name || "",
    about: users?.about || "",
    tags: users?.tags || [],

  });
  const [newTag, setNewTag] = useState("");

  // Transfer Points State
  const [receiverId, setReceiverId] = useState("");
  const [transferPoints, setTransferPoints] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState("");

  // Derived state for the selected recipient chip
  const selectedRecipient = allUsers.find(u => u._id === receiverId);
  const [paymentStatus, setPaymentStatus] = useState({
    isPaymentWindowOpen: false,
    countdown: 0,
  });

  const [formattedCountdown, setFormattedCountdown] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(
    users?.phoneNumber || ""
  );

  const [mobileOTP, setMobileOTP] = useState("");

  const [sendingOTP, setSendingOTP] =
    useState(false);

  const [verifyingOTP, setVerifyingOTP] =
    useState(false);

  const [showOTPBox, setShowOTPBox] =
    useState(false);

  const [mobileVerified, setMobileVerified] =
    useState(false);


  useEffect(() => {
    const fetchuser = async () => {
      try {
        const res = await axiosInstance.get("/user/getalluser");
        const matcheduser = res.data.data.find((u: any) => u._id === id);
        setusers(matcheduser);
        setAllUsers(res.data.data);
        setPhoneNumber(
          matcheduser.phoneNumber || ""
        );

        setMobileVerified(
          matcheduser.mobileVerified
        );
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    if (id) fetchuser();
  }, [id]);

  if (loading) {
    return (
      <Mainlayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </Mainlayout>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Mainlayout>
        <div className="text-center text-gray-400 mt-10 font-mono">
          {translate("404 // USER_NOT_FOUND")}
        </div>
      </Mainlayout>
    );
  }

  const handleSaveProfile = async () => {
    try {
      const res = await axiosInstance.patch(`/user/update/${user?._id}`, { editForm });
      if (res.data.data) {
        const updatedUser = {
          ...users,
          name: editForm.name,
          about: editForm.about,
          tags: editForm.tags,
        };
        setusers(updatedUser);
        setIsEditing(false);
        toast.success(translate("Profile updated successfully!"));
      }
    } catch (error) {
      console.log(error);
      toast.error(translate("Something went wrong"));
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !editForm.tags.includes(trimmedTag)) {
      setEditForm({ ...editForm, tags: [...editForm.tags, trimmedTag] });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditForm({
      ...editForm,
      tags: editForm.tags.filter((tag: any) => tag !== tagToRemove),
    });
  };

  const handleSendFriendRequest = async () => {
    try {

      const res = await sendFriendRequest(
        user._id,
        users._id
      );

      toast.success(res.message);

      const refetch =
        await axiosInstance.get("/user/getalluser");

      const matchedUser =
        refetch.data.data.find(
          (u: any) => u._id === id
        );

      setusers(matchedUser);

      setAllUsers(refetch.data.data);

    } catch (error: any) {

      toast.error(
        error.response?.data?.message ||
        translate("Failed to send request")
      );

    }
  };

  const handleAcceptRequest = async (senderId: string) => {
    if (!user?._id) return;

    try {
      const res = await acceptFriendRequest(
        user._id,
        senderId
      );

      toast.success(res.message);

      // Refresh the viewed profile
      const refetch = await axiosInstance.get("/user/getalluser");

      const matchedUser = refetch.data.data.find(
        (u: any) => u._id === id
      );

      setusers(matchedUser);
      setAllUsers(refetch.data.data);

    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
        translate("Failed to accept request")
      );
    }
  };
  const handleRejectRequest = async (senderId: string) => {
    if (!user?._id) return;

    try {
      const res = await rejectFriendRequest(
        user._id,
        senderId
      );

      toast.success(res.message);

      // Refresh the viewed profile
      const refetch = await axiosInstance.get("/user/getalluser");

      const matchedUser = refetch.data.data.find(
        (u: any) => u._id === id
      );

      setusers(matchedUser);
      setAllUsers(refetch.data.data);

    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
        translate("Failed to reject request")
      );
    }
  };

  const handleLanguageChange = async (language: string) => {

    try {

      const res = await axiosInstance.patch(

        `/user/language/${user?._id}`,

        { language }

      );

      if (res.data.otpRequired) {

        setSelectedLanguage(language);

        setShowOtpInput(true);

        toast.success(res.data.message);

        return;

      }

      toast.success(

        translate("Language updated successfully")

      );

      const updatedUser = {

        ...user,

        language

      };

      localStorage.setItem(

        "user",

        JSON.stringify(updatedUser)

      );

      window.location.reload();

    }

    catch (error: any) {

      toast.error(

        error.response?.data?.message ||

        translate("Something went wrong")

      );

    }

  };

  const handleTransferPoints = async () => {
    if (!receiverId || !transferPoints) return;
    setIsTransferring(true);

    try {
      const res = await axiosInstance.post("/user/transfer-points", {
        senderId: user?._id,
        receiverId,
        points: Number(transferPoints),
      });
      toast.success(res.data.message);

      // Reset forms
      setReceiverId("");
      setSearchUser("");
      setTransferPoints("");

      const refetch = await axiosInstance.get("/user/getalluser");
      const matcheduser = refetch.data.data.find((u: any) => u._id === id);
      setusers(matcheduser);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || translate("Transfer failed"));
    } finally {
      setIsTransferring(false);
    }
  };

  const verifyLanguageOTP = async () => {

    try {

      const isFrench =
        selectedLanguage === "French";

      const route = isFrench

        ? `/user/verify-language-otp/${user?._id}`

        : `/user/verify-mobile-language/${user?._id}`;

      const res = await axiosInstance.post(

        route,

        {

          otp

        }

      );

      const updatedUser = {

        ...user,

        language: res.data.language

      };

      localStorage.setItem(

        "user",

        JSON.stringify(updatedUser)

      );

      toast.success(

        translate("Language updated successfully")

      );

      setShowOtpInput(false);

      setOtp("");

      setSelectedLanguage("");

      window.location.reload();

    }

    catch (error: any) {

      toast.error(

        error.response?.data?.message ||

        translate("Verification failed")

      );

    }

  };
  const handleSendOTP = async () => {

    if (!user?._id) return;

    if (!phoneNumber) {

      toast.error(
        translate("Please enter a phone number.")
      );

      return;

    }

    try {

      setSendingOTP(true);

      const res = await sendMobileOTP(

        user._id,

        phoneNumber

      );

      toast.success(res.message);

      setShowOTPBox(true);

    }

    catch (error: any) {

      toast.error(

        error.response?.data?.message ||

        translate("Failed to send OTP.")

      );

    }

    finally {

      setSendingOTP(false);

    }

  };
  const handleVerifyOTP = async () => {

    if (!user?._id) return;

    if (!mobileOTP) {

      toast.error(

        translate("Please enter the OTP.")

      );

      return;

    }

    try {

      setVerifyingOTP(true);

      const res = await verifyMobileOTP(

        user._id,

        mobileOTP

      );

      toast.success(res.message);

      setMobileVerified(true);

      setShowOTPBox(false);

      setMobileOTP("");

      // Refresh profile

      const refresh = await axiosInstance.get(

        "/user/getalluser"

      );

      const updatedUser =

        refresh.data.data.find(

          (u: any) => u._id === id

        );

      setusers(updatedUser);

      setMobileVerified(

        updatedUser.mobileVerified

      );

    }

    catch (error: any) {

      toast.error(

        error.response?.data?.message ||

        translate("Verification failed.")

      );

    }

    finally {

      setVerifyingOTP(false);

    }

  };

  const handlePayment = async (amount: number, plan: string) => {
    if (!paymentStatus.isPaymentWindowOpen) {

      toast.error(
        "Payments are available only between 10:00 AM and 11:00 AM IST."
      );

      return;

    }
    try {
      const { data } = await axiosInstance.post("/user/create-order", { amount });
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        order_id: data.id,
        name: translate("Community Hub"),
        description: `${plan} ${translate("Subscription")}`,
        handler: async () => {
          await axiosInstance.patch(`/user/subscription/${user?._id}`, { subscriptionPlan: plan });
          toast.success(`${plan} ${translate("activated")}`);
          window.location.reload();
        },
      };
      console.log("Razorpay =", (window as any).Razorpay);
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.log(error);
      toast.error(translate("Payment failed"));
    }
  };

  const currentUserId = user?._id;
  const isOwnProfile = id === currentUserId;
  const isFriend =
    user?.friends?.includes(users?._id);

  const requestSent =
    user?.sentRequests?.includes(users?._id);

  const requestReceived =
    user?.friendRequests?.includes(users?._id);
  const friendCount = users?.friends?.length || 0;

  const filteredUsers = allUsers.filter(
    (u) => u._id !== user?._id && u.name.toLowerCase().includes(searchUser.toLowerCase())
  );
  const getDeviceIcon = (device: string) => {

    switch (device?.toLowerCase()) {

      case "mobile":
        return <Smartphone className="w-5 h-5 text-green-400" />;

      case "tablet":
        return <Tablet className="w-5 h-5 text-blue-400" />;

      default:
        return <Monitor className="w-5 h-5 text-purple-400" />;

    }

  };

  const getBrowserIcon = (browser: string) => {

    switch (browser?.toLowerCase()) {

      case "chrome":
        return <Chrome className="w-5 h-5 text-yellow-400" />;

      default:
        return <Globe className="w-5 h-5 text-gray-400" />;

    }

  };

  const getRelativeTime = (date: string) => {

    const now = new Date();

    const login = new Date(date);

    const diff =
      Math.floor(
        (now.getTime() - login.getTime()) / 1000
      );

    if (diff < 60) return "Just now";

    if (diff < 3600)
      return `${Math.floor(diff / 60)} min ago`;

    if (diff < 86400)
      return `${Math.floor(diff / 3600)} hrs ago`;

    return `${Math.floor(diff / 86400)} days ago`;

  };
  const loginHistory = [...(users.loginHistory || [])]
    .sort(
      (a: any, b: any) =>
        new Date(b.loginTime).getTime() -
        new Date(a.loginTime).getTime()
    );

  const latestLoginTime =
    loginHistory.length > 0
      ? new Date(loginHistory[0].loginTime).getTime()
      : 0;

  return (
    <Mainlayout>
      <div className="relative min-h-screen bg-[#050505] text-white p-4 lg:p-8 font-sans overflow-hidden">
        {/* Floating Gradient Ambient Background */}
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vh] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto space-y-8 z-10">

          {/* 1. HERO PROFILE SECTION */}
          <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-white/10 to-transparent shadow-2xl shadow-purple-900/20">
            <div className="rounded-[23px] bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/5 p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">

                {/* Avatar with Shine Ring */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-500"></div>
                  <Avatar className="relative w-32 h-32 lg:w-40 lg:h-40 border-2 border-black">
                    <AvatarFallback className="text-4xl lg:text-5xl bg-[#111] text-white font-bold tracking-tighter">
                      {users.name.split(" ").map((n: any) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Profile Details */}
                <div className="flex-1 text-center lg:text-left space-y-4 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-2">
                        {users.name}
                      </h1>
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm text-gray-400">
                        {users.email && (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            {users.email}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                          <Calendar className="w-3.5 h-3.5" />
                          {translate("Joined")} {new Date(users.joinDate).toISOString().split("T")[0]}
                        </span>
                      </div>
                    </div>

                    {/* Edit Profile / Add Friend Action */}
                    <div className="shrink-0">
                      {isOwnProfile ? (
                        <Dialog open={isEditing} onOpenChange={setIsEditing}>
                          <DialogTrigger asChild>
                            <Button className="bg-white text-black hover:bg-gray-200 font-semibold rounded-xl px-6 transition-all duration-300">
                              <Edit className="w-4 h-4 mr-2" />
                              {translate("Edit Profile")}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-[#111] border border-white/10 text-white rounded-3xl p-6">
                            <DialogHeader>
                              <DialogTitle className="text-xl tracking-tight">{translate("Edit Profile")}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                              <div className="space-y-4">
                                <Label htmlFor="name" className="text-gray-400">{translate("Display Name")}</Label>
                                <Input
                                  id="name"
                                  value={editForm.name}
                                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                  className="bg-black border-white/10 text-white focus:ring-purple-500 rounded-xl"
                                />
                              </div>
                              <div className="space-y-4">
                                <Label htmlFor="about" className="text-gray-400">{translate("About Me")}</Label>
                                <Textarea
                                  id="about"
                                  value={editForm.about}
                                  onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
                                  className="bg-black border-white/10 text-white min-h-[120px] rounded-xl"
                                />
                              </div>
                              <div className="space-y-4">
                                <Label className="text-gray-400">{translate("Skills & Technologies")}</Label>
                                <div className="flex gap-2">
                                  <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                                    className="bg-black border-white/10 text-white rounded-xl"
                                  />
                                  <Button onClick={handleAddTag} className="bg-purple-600 hover:bg-purple-700 rounded-xl">
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {editForm.tags.map((tag: any) => (
                                    <Badge key={tag} className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-lg">
                                      {tag}
                                      <button onClick={() => handleRemoveTag(tag)} className="ml-2 hover:text-white">
                                        <X className="w-3 h-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <Button variant="ghost" onClick={() => setIsEditing(false)} className="hover:bg-white/5 rounded-xl">
                                  {translate("Cancel")}
                                </Button>
                                <Button onClick={handleSaveProfile} className="bg-white text-black hover:bg-gray-200 rounded-xl">
                                  {translate("Save Changes")}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <>
                          {isFriend ? (

                            <Button
                              disabled
                              className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold rounded-xl px-6 cursor-default shadow-lg shadow-emerald-900/10"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {translate("Already Friends")}
                            </Button>

                          ) : requestSent ? (

                            <Button
                              disabled
                              className="bg-amber-500/15 border border-amber-500/30 text-amber-400 font-semibold rounded-xl px-6 cursor-default shadow-lg shadow-amber-900/10"
                            >
                              <Clock3 className="w-4 h-4 mr-2" />
                              {translate("Request Sent")}
                            </Button>

                          ) : requestReceived ? (

                            <div className="flex items-center gap-3">

                              <Button
                                onClick={() => handleAcceptRequest(users._id)}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl px-5"
                              >
                                <UserCheck className="w-4 h-4 mr-2" />
                                {translate("Accept")}
                              </Button>

                              <Button
                                onClick={() => handleRejectRequest(users._id)}
                                variant="destructive"
                                className="rounded-xl px-5"
                              >
                                <UserX className="w-4 h-4 mr-2" />
                                {translate("Reject")}
                              </Button>

                            </div>

                          ) : (

                            <Button
                              onClick={handleSendFriendRequest}
                              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-900/20"
                            >
                              <Users className="w-4 h-4 mr-2" />
                              {translate("Add Friend")}
                            </Button>

                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Top Level Badges */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2">
                    <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-lg font-mono text-xs uppercase tracking-wider">
                      {users.subscriptionPlan || translate("FREE")} {translate("PLAN")}
                    </Badge>
                    {users.badges?.map((badge: string) => {
                      let icon = <Award className="w-3 h-3 mr-1.5" />;
                      if (badge.includes("Elite")) icon = <Shield className="w-3 h-3 mr-1.5 text-yellow-400" />;
                      if (badge.includes("Gold")) icon = <Zap className="w-3 h-3 mr-1.5 text-orange-400" />;

                      return (
                        <Badge key={badge} className="bg-white/5 text-gray-300 border border-white/10 px-3 py-1 rounded-lg flex items-center">
                          {icon} {translate(badge)}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. STATS GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              { label: translate("Reward Points"), value: users.rewardPoints || 0, icon: <Zap className="w-5 h-5 text-yellow-500" /> },
              { label: translate("Network"), value: friendCount, icon: <Users className="w-5 h-5 text-blue-500" /> },
              { label: translate("Questions"), value: 0, icon: <MessageSquare className="w-5 h-5 text-purple-500" /> },
              { label: translate("Answers"), value: 0, icon: <MessageCircle className="w-5 h-5 text-green-500" /> },
            ].map((stat, i) => (
              <Card key={i} className="bg-[#0A0A0A]/60 backdrop-blur-md border-white/5 hover:border-purple-500/30 transition-colors duration-300 rounded-3xl overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                    <div className="p-2 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">{stat.icon}</div>
                  </div>
                  <h3 className="text-3xl font-bold font-mono tracking-tighter text-white">{stat.value}</h3>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* LEFT COLUMN: MAIN CONTENT */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8">

              {/* About Section */}
              <Card className="bg-[#0A0A0A]/80 backdrop-blur-xl border-white/5 rounded-3xl">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
                    <Shield className="w-5 h-5 text-purple-500" /> {translate("About")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line text-[15px]">
                    {users.about || <span className="text-gray-600 italic">No description provided.</span>}
                  </p>
                </CardContent>
              </Card>

              {/* Tags Section */}
              <Card className="bg-[#0A0A0A]/80 backdrop-blur-xl border-white/5 rounded-3xl">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-lg font-semibold text-white">{translate("Top Skills")}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 flex flex-wrap gap-2">
                  {users.tags?.length > 0 ? (
                    users.tags.map((tag: string) => (
                      <Badge key={tag} className="bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 px-4 py-1.5 rounded-xl text-sm transition-colors">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-600 text-sm">{translate("No tags added yet.")}</p>
                  )}
                </CardContent>
              </Card>

              {/* Login History Timeline */}
              {isOwnProfile && (
                <Card className="bg-[#0A0A0A]/80 backdrop-blur-xl border-white/5 rounded-3xl">
                  <CardHeader className="border-b border-white/5 pb-4">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
                      <Clock className="w-5 h-5 text-indigo-500" />
                      {translate("Activity Log")}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-6">

                    <div className="relative border-l border-white/10 ml-4 space-y-6 pb-4">

                      {loginHistory.length > 0 ? (

                        loginHistory.map((log: any, index: number) => {

                          const isCurrentSession =
                            new Date(log.loginTime).getTime() ===
                            latestLoginTime;

                          return (

                            <div
                              key={index}
                              className="relative pl-8 group"
                            >

                              {/* Timeline Dot */}
                              <div className="absolute -left-1.5 top-2 h-3 w-3 rounded-full border-2 border-[#0A0A0A] bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)] group-hover:scale-125 transition-transform" />

                              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-purple-500/30 transition-all duration-300">

                                <div className="flex items-start justify-between gap-4">

                                  <div className="space-y-4 flex-1">

                                    <div className="flex items-center gap-3">

                                      {getDeviceIcon(log.device)}

                                      <div>

                                        <p className="text-white font-semibold">

                                          {log.device}

                                        </p>

                                        <p className="text-xs text-gray-400">

                                          {getRelativeTime(log.loginTime)}

                                        </p>

                                      </div>

                                    </div>

                                    <div className="flex items-center gap-2">

                                      {getBrowserIcon(log.browser)}

                                      <span className="text-gray-300">

                                        {log.browser}

                                        {log.browserVersion &&
                                          ` ${log.browserVersion}`}

                                      </span>

                                    </div>

                                    <p className="text-sm text-gray-400">

                                      {log.os}

                                      {log.osVersion &&
                                        ` ${log.osVersion}`}

                                    </p>

                                    <p className="text-xs text-gray-500 font-mono break-all">

                                      {log.ip}

                                    </p>

                                    <p className="text-xs text-gray-600">

                                      {new Date(
                                        log.loginTime
                                      ).toLocaleString()}

                                    </p>

                                  </div>

                                  {isCurrentSession && (

                                    <Badge className="bg-green-500/20 text-green-300 border border-green-500/40 whitespace-nowrap">

                                      🟢 {translate("Current Session")}

                                    </Badge>

                                  )}

                                </div>

                              </div>

                            </div>

                          );

                        })

                      ) : (

                        <p className="text-gray-600 text-sm pl-6">

                          {translate("No recent activity.")}

                        </p>

                      )}

                    </div>

                  </CardContent>
                </Card>
              )}
            </div>

            {/* RIGHT COLUMN: SAAS CONTROLS */}
            <div className="space-y-6 lg:space-y-8">

              {/* Subscription Management */}
              <Card className="relative overflow-hidden bg-[#0A0A0A]/80 backdrop-blur-xl border-white/5 rounded-3xl">
                {/* Decorative background glow for pricing */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
                <CardHeader className="border-b border-white/5 pb-4 relative z-10">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
                    <CreditCard className="w-5 h-5 text-blue-400" /> {translate("Subscription")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 relative z-10">
                  <div className="mb-6">
                    <p className="text-sm text-gray-400 mb-1">{translate("Current Plan")}</p>
                    <div className="flex items-baseline gap-2">

                      <span className="text-2xl font-bold tracking-tight text-white uppercase">
                        {users.subscriptionPlan || translate("FREE")}
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>
                    </div>
                  </div>

                  {isOwnProfile && (
                    <div className="space-y-2">

                      <Button onClick={() => handlePayment(100, "BRONZE")} className="w-full justify-between bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 rounded-xl">
                        <span>Bronze Tier</span> <span className="font-mono text-purple-400">₹100</span>
                      </Button>
                      <Button onClick={() => handlePayment(300, "SILVER")} className="w-full justify-between bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 rounded-xl">
                        <span>Silver Tier</span> <span className="font-mono text-purple-400">₹300</span>
                      </Button>
                      <Button onClick={() => handlePayment(1000, "GOLD")} className="w-full justify-between bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-purple-900/20 rounded-xl">
                        <span>Gold Tier</span> <span className="font-mono font-bold">₹1000</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Point Transfer Engine - PREMIUM REDESIGN WITH BUG FIX */}
              {isOwnProfile && (
                <Card className="relative overflow-hidden bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-3xl group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 blur-3xl rounded-full pointer-events-none transition-all duration-500 group-hover:bg-green-500/20" />
                  <CardHeader className="border-b border-white/5 pb-4 relative z-10">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
                      <ArrowRightLeft className="w-5 h-5 text-green-400" /> {translate("Transfer Points")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4 relative z-10">

                    {/* User Selection Logic: Show Chip if selected, else show Search */}
                    {!receiverId ? (
                      <div className="relative">
                        <div className="relative flex items-center bg-[#111] border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-green-500/50 focus-within:ring-1 focus-within:ring-green-500/50 transition-all">
                          <Search className="w-4 h-4 text-gray-500 mr-2" />
                          <input
                            type="text"
                            placeholder={translate("Search recipient...")}
                            value={searchUser}
                            onChange={(e) => setSearchUser(e.target.value)}
                            className="w-full bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none py-1"
                          />
                        </div>

                        {/* Dropdown Results */}
                        {filteredUsers.length > 0 && searchUser && (
                          <div className="absolute top-full left-0 right-0 mt-2 max-h-48 overflow-y-auto bg-[#111] border border-white/10 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] z-50 p-1 custom-scrollbar">
                            {filteredUsers.slice(0, 5).map((u) => (
                              <div
                                key={u._id}
                                className="p-3 cursor-pointer hover:bg-white/5 rounded-lg flex items-center gap-3 transition-colors"
                                onClick={() => {
                                  setReceiverId(u._id);
                                  setSearchUser(""); // FIX: Clear search to destroy dropdown overlay safely
                                }}
                              >
                                <Avatar className="w-6 h-6 border border-white/10">
                                  <AvatarFallback className="text-[10px] bg-black text-gray-300">
                                    {u.name?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-gray-300">{u.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Selected User Premium Chip */
                      <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 border border-green-500/30">
                            <AvatarFallback className="text-xs bg-black text-green-400 font-bold">
                              {selectedRecipient?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-green-100">{selectedRecipient?.name}</span>
                            <span className="text-[10px] text-green-500/80 font-mono tracking-wider uppercase">{translate("Selected")}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setReceiverId("")}
                          className="p-1.5 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Amount & Send Row */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          type="number"
                          placeholder="0"
                          value={transferPoints}
                          onChange={(e) => setTransferPoints(e.target.value)}
                          className="pl-9 bg-black border-white/10 text-white rounded-xl font-mono focus-visible:ring-green-500/50 focus-visible:border-green-500/50 transition-all"
                        />
                      </div>
                      <Button
                        disabled={!receiverId || !transferPoints || isTransferring}
                        onClick={handleTransferPoints}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl px-6 font-semibold shrink-0 disabled:opacity-50 transition-all active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.2)] disabled:shadow-none"
                      >
                        {isTransferring ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            {translate("Send")} <CheckCircle2 className="w-4 h-4 ml-1.5 opacity-70" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Phone Verification */}
              {isOwnProfile && (
                <Card className="bg-[#0A0A0A]/80 backdrop-blur-xl border-white/5 rounded-3xl">
                  <CardHeader className="border-b border-white/5 pb-4">
                    <CardTitle className="text-lg font-semibold text-white">
                      {translate("Phone Verification")}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-6 space-y-6">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-sm text-gray-400">
                          {translate("Phone Number")}
                        </p>

                        <Input
                          value={phoneNumber}
                          disabled={mobileVerified}
                          onChange={(e) =>
                            setPhoneNumber(e.target.value)
                          }
                          placeholder="+91XXXXXXXXXX"
                          className="mt-2 bg-black border-white/10 rounded-xl text-white"
                        />

                      </div>

                      {mobileVerified ? (

                        <Badge className="bg-green-500/20 text-green-300 border-green-500/40">

                          ✓ {translate("Verified")}

                        </Badge>

                      ) : (

                        <Badge className="bg-red-500/20 text-red-300 border-red-500/40">

                          {translate("Not Verified")}

                        </Badge>

                      )}

                    </div>

                    {!mobileVerified && (

                      <>
                        {!showOTPBox ? (

                          <Button
                            onClick={handleSendOTP}
                            disabled={sendingOTP}
                            className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl"
                          >

                            {sendingOTP

                              ? translate("Sending...")

                              : translate("Send OTP")}

                          </Button>

                        ) : (

                          <div className="space-y-4">

                            <Input

                              value={mobileOTP}

                              maxLength={6}

                              onChange={(e) =>

                                setMobileOTP(

                                  e.target.value

                                )

                              }

                              placeholder="••••••"

                              className="bg-black border-white/10 text-white rounded-xl text-center tracking-[0.5em]"

                            />

                            <Button

                              onClick={handleVerifyOTP}

                              disabled={verifyingOTP}

                              className="w-full bg-green-600 hover:bg-green-700 rounded-xl"

                            >

                              {verifyingOTP

                                ? translate("Verifying...")

                                : translate("Verify Phone")}

                            </Button>

                          </div>

                        )}

                      </>

                    )}

                  </CardContent>

                </Card>
              )}

              {/* Language Preferences */}
              {isOwnProfile && (
                <Card className="bg-[#0A0A0A]/80 backdrop-blur-xl border-white/5 rounded-3xl">
                  <CardHeader className="border-b border-white/5 pb-4">
                    <CardTitle className="text-lg font-semibold text-white">{translate("Language Change")}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-400">{translate("Current")}</span>
                      <span className="text-sm font-semibold text-white bg-white/10 px-3 py-1 rounded-full">{users.language || 'English'}</span>
                    </div>
                    {!mobileVerified && (

                      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">

                        <p className="text-sm text-yellow-300">

                          {translate(

                            "Verify your phone number first to change your language."

                          )}

                        </p>

                      </div>

                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {["English", "Spanish", "Hindi", "French", "Portuguese", "Chinese"].map((lang) => (
                        <Button
                          key={lang}
                          variant="outline"
                          size="sm"
                          onClick={() => handleLanguageChange(lang)}
                          disabled={!mobileVerified && lang !== "French"}
                          className={`rounded-xl transition-all py-5 flex flex-col items-center justify-center gap-1
    ${!mobileVerified && lang !== "French"
                              ? "bg-white/5 border-white/5 text-gray-600 cursor-not-allowed opacity-60"
                              : "bg-transparent border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                          <span>{translate(lang)}</span>

                          {!mobileVerified && lang !== "French" && (
                            <span className="text-[10px] text-yellow-400 font-medium">
                              {translate("Verify Phone")}
                            </span>
                          )}
                        </Button>
                      ))}
                    </div>

                    {showOtpInput && (
                      <div className="mt-6 p-5 bg-white/5 rounded-2xl border border-purple-500/30 space-y-4">
                        <Label className="text-xs text-purple-300 uppercase tracking-wider">{translate("Security Check")}</Label>

                        {/* Changed to flex-col to stack input and button on separate lines */}
                        <div className="flex flex-col gap-3">
                          <Input
                            type="text"
                            placeholder="••• •••"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full bg-black border-white/20 text-white rounded-xl font-mono text-center tracking-[0.5em] text-lg h-12 focus-visible:ring-purple-500/50"
                          />
                          <Button
                            onClick={verifyLanguageOTP}
                            // Added w-full so the button spans the whole line below the input
                            className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl text-white h-12 font-semibold"
                          >
                            {translate("Verify")}
                          </Button>
                        </div>

                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Mainlayout>
  );
};

export default index;