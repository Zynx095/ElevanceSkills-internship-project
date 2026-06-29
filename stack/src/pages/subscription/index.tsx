import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
    ArrowLeft,
    Check,
    Home,
    Zap,
    Crown,
    AlertTriangle,
    Infinity as InfinityIcon,
    Calendar,
    CheckCircle2,
    Lock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import axiosInstance from "@/lib/axiosinstance";
import { useLanguage } from "@/lib/LanguageContext";

const translate = (text: string) => text;

interface QuestionStatus {
    plan: string;
    used: number;
    remaining: number;
    limit: number | typeof Infinity;
    expiryDate?: string;
}

// 1. BULLETPROOF SCRIPT LOADER
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const SubscriptionPage = () => {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [questionStatus, setQuestionStatus] = useState<QuestionStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState({
        isPaymentWindowOpen: false,
        countdown: 0,
    });

    const [formattedCountdown, setFormattedCountdown] = useState("");

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(storedUser);
    }, []);

    const fetchQuestionStatus = useCallback(async (userId: string) => {
        try {
            const res = await axiosInstance.get(`/question/status/${userId}`);
            const data = res.data;
            if (data.limit === "Infinity" || data.limit === null) data.limit = Infinity;
            if (data.remaining === "Infinity" || data.remaining === null) data.remaining = Infinity;
            setQuestionStatus(data);
        } catch (error) {
            console.log(error);
            toast.error(translate("Failed to sync subscription status."));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?._id) {
            fetchQuestionStatus(user._id);
        }
    }, [user?._id, fetchQuestionStatus]);
    useEffect(() => {

        fetchPaymentStatus();

        const interval = setInterval(() => {
            fetchPaymentStatus();
        }, 1000);

        return () => clearInterval(interval);

    }, []);
    useEffect(() => {

        const totalSeconds =
            paymentStatus.countdown;

        const hours =
            Math.floor(totalSeconds / 3600);

        const minutes =
            Math.floor(
                (totalSeconds % 3600) / 60
            );

        const seconds =
            totalSeconds % 60;

        setFormattedCountdown(
            `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        );

    }, [paymentStatus]);

    const currentPlan = questionStatus?.plan || user?.subscriptionPlan || "FREE";
    const isUnlimited = questionStatus?.limit === Infinity;
    const limitReached = !isUnlimited && questionStatus && questionStatus.used >= (questionStatus.limit as number);
    const progressPercentage = questionStatus ? (questionStatus.limit === Infinity ? 100 : (questionStatus.used / (questionStatus.limit as number)) * 100) : 0;

    // 2. FIXED PAYMENT HANDLER
    const fetchPaymentStatus = async () => {
        try {
            const res = await axiosInstance.get(
                "/user/payment-status"
            );

            setPaymentStatus(res.data);

        } catch (error) {
            console.log(error);
        }
    };
    const handlePayment = async (amount: number, plan: string) => {
        if (!paymentStatus.isPaymentWindowOpen) {

            toast.error(
                "Payments are available only between 10:00 AM and 11:00 AM IST."
            );

            return;

        }
        setIsProcessing(plan);
        try {
            // Guarantee Razorpay SDK is loaded
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                toast.error(translate("Razorpay SDK failed to load. Check your connection."));
                setIsProcessing(null);
                return;
            }

            const { data } = await axiosInstance.post("/user/create-order", { amount });

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Ensure this exists in .env.local!
                amount: data.amount,
                currency: data.currency,
                order_id: data.id,
                name: translate("Community Hub"),
                description: `${plan} ${translate("Subscription")}`,
                handler: async () => {
                    await axiosInstance.patch(`/user/subscription/${user?._id}`, { subscriptionPlan: plan });

                    const updatedUser = { ...user, subscriptionPlan: plan };
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    setUser(updatedUser);

                    if (user?._id) {
                        setIsLoading(true);
                        await fetchQuestionStatus(user._id);
                    }
                    toast.success(`${plan} ${translate("activated")}`);
                },
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.log("Payment Error: ", error);
            toast.error(translate("Payment failed to initialize."));
        } finally {
            setIsProcessing(null);
        }
    };

    const scrollToPricing = () => {
        document.getElementById("pricing-section")?.scrollIntoView({ behavior: "smooth" });
    };

    const getBadgeStyle = (plan: string) => {
        switch (plan.toUpperCase()) {
            case 'GOLD': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            case 'SILVER': return 'bg-gray-300/10 text-gray-300 border-gray-400/30';
            case 'BRONZE': return 'bg-amber-700/10 text-amber-500 border-amber-700/30';
            default: return 'bg-white/10 text-gray-300 border-white/20';
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30 overflow-x-hidden pb-24">
            <Head>
                <title>Subscription | Premium Access</title>
            </Head>

            <div className="fixed top-[-20%] left-[-10%] w-[70vw] h-[70vh] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[60vw] h-[60vh] bg-indigo-900/10 rounded-full blur-[150px] pointer-events-none z-0" />
            <div className="fixed top-[20%] right-[20%] w-[30vw] h-[30vw] bg-yellow-600/5 rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <Link href="/ask">
                        <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Questions
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
                            <Home className="w-4 h-4 mr-2" /> Back to Home
                        </Button>
                    </Link>
                </div>

                {limitReached && !isLoading && (
                    <div className="mb-8 p-1 rounded-2xl bg-gradient-to-r from-red-500/50 to-orange-500/50 animate-pulse-slow shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                        <div className="bg-[#111] backdrop-blur-xl rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-500/10 rounded-full shrink-0">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-red-400 font-bold text-lg">Question Limit Reached</h3>
                                    <p className="text-gray-400 text-sm">You have used all available questions for today.</p>
                                </div>
                            </div>
                            <Button
                                onClick={scrollToPricing}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl px-8 shadow-lg shadow-red-500/20 whitespace-nowrap"
                            >
                                Upgrade Plan
                            </Button>
                        </div>
                    </div>
                )}

                <div className="text-center space-y-6 mb-16 pt-8">
                    <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-4 py-1.5 rounded-full text-sm font-medium tracking-wide">
                        Premium Access
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 drop-shadow-sm">
                        Unlock More Questions
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                        Choose a subscription plan and increase your daily question posting limit. Join our elite contributors.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto mb-20">
                    <Card className="bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-3xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
                        <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.02]">
                            <CardTitle className="text-xl font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <span className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-purple-400" />
                                    Subscription Summary
                                </span>
                                {isLoading ? (
                                    <div className="h-8 w-24 bg-white/10 animate-pulse rounded-full" />
                                ) : (
                                    <Badge variant="outline" className={`px-4 py-1.5 text-xs font-bold tracking-widest ${getBadgeStyle(currentPlan)}`}>
                                        {currentPlan} PLAN
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8">
                            {isLoading ? (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-x divide-white/5">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="space-y-3 px-4">
                                                <div className="h-3 w-16 bg-white/10 animate-pulse mx-auto rounded" />
                                                <div className="h-8 w-12 bg-white/10 animate-pulse mx-auto rounded" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : isUnlimited ? (
                                <div className="text-center py-6 space-y-4">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-2">
                                        <InfinityIcon className="w-10 h-10 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                                        Unlimited Questions Enabled
                                    </h3>
                                    <p className="text-gray-400 text-lg">You have unrestricted access to the community.</p>
                                    {questionStatus?.expiryDate && (
                                        <div className="pt-4 mt-4 border-t border-white/5 inline-flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            Renews on: {new Date(questionStatus.expiryDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-white/10">
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Used Today</p>
                                            <p className="text-4xl font-mono font-bold text-white">{questionStatus?.used}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Remaining</p>
                                            <p className={`text-4xl font-mono font-bold ${questionStatus?.remaining === 0 ? 'text-red-500' : 'text-purple-400'}`}>
                                                {questionStatus?.remaining}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Daily Limit</p>
                                            <p className="text-4xl font-mono font-bold text-gray-300">{questionStatus?.limit}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Renewal</p>
                                            <p className="text-lg font-bold text-gray-400 mt-2 flex items-center justify-center gap-2">
                                                {questionStatus?.expiryDate ? new Date(questionStatus.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-3 pt-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span className="text-gray-400">Daily Question Progress</span>
                                            <span className={limitReached ? "text-red-400 font-bold" : "text-white"}>
                                                {questionStatus?.used} / {questionStatus?.limit}
                                            </span>
                                        </div>
                                        <Progress value={progressPercentage} className={`h-3 bg-black border border-white/10 ${limitReached ? '[&>div]:bg-red-500' : '[&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-indigo-500'}`} />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <Card className={`mb-8 rounded-3xl border backdrop-blur-xl transition-all duration-500 ${paymentStatus.isPaymentWindowOpen
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-red-500/20 bg-red-500/5"
                    }`}>
                    <CardContent className="py-8">

                        <div className="flex flex-col items-center text-center">

                            <div
                                className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${paymentStatus.isPaymentWindowOpen
                                    ? "bg-green-500/15"
                                    : "bg-red-500/15"
                                    }`}
                            >

                                {paymentStatus.isPaymentWindowOpen ? (

                                    <CheckCircle2 className="w-10 h-10 text-green-400" />

                                ) : (

                                    <Lock className="w-10 h-10 text-red-400" />

                                )}

                            </div>

                            <h2 className="text-3xl font-bold text-white">

                                {paymentStatus.isPaymentWindowOpen
                                    ? "Payments are Live"
                                    : "Payment Window Closed"}

                            </h2>

                            <p className="text-gray-400 mt-3 max-w-xl">

                                {paymentStatus.isPaymentWindowOpen
                                    ? "You can upgrade your subscription until 11:00 AM IST."
                                    : "Subscription upgrades are available every day from 10:00 AM to 11:00 AM IST."}

                            </p>

                            <div className="mt-8">

                                <div className="text-gray-400 uppercase tracking-[0.25em] text-sm">

                                    {paymentStatus.isPaymentWindowOpen
                                        ? "Window closes in"
                                        : "Opens in"}

                                </div>

                                <div className="mt-2 font-mono text-6xl font-black text-white">

                                    {formattedCountdown}

                                </div>

                            </div>

                        </div>

                    </CardContent>
                </Card>

                <div id="pricing-section" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 items-center">
                    {/* FREE PLAN */}
                    <Card className={`relative bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/5 rounded-3xl flex flex-col transition-all duration-300 hover:border-white/20 ${currentPlan === 'FREE' ? 'ring-2 ring-purple-500/50' : ''}`}>
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-gray-300 uppercase tracking-widest">Free Plan</CardTitle>
                            <div className="mt-4 flex items-baseline text-4xl font-extrabold text-white">
                                ₹0 <span className="ml-1 text-xl font-medium text-gray-500">/month</span>
                            </div>
                            <p className="text-purple-400 mt-2 font-medium">1 Question Per Day</p>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-4 text-sm text-gray-300">
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-purple-500" /> Community Access</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-purple-500" /> Public Feed Access</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-purple-500" /> Language Translation</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-purple-500" /> Basic Profile</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button disabled className="w-full rounded-xl bg-white/5 text-gray-400 border border-white/10 py-6">
                                {currentPlan === 'FREE' ? '✓ Active Plan' : 'Current Plan'}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* BRONZE PLAN */}
                    <Card className={`relative bg-gradient-to-b from-[#1a110a]/80 to-[#0A0A0A]/90 backdrop-blur-xl border border-amber-900/30 rounded-3xl flex flex-col transition-all duration-300 hover:border-amber-700/50 hover:shadow-[0_0_30px_rgba(217,119,6,0.1)] ${currentPlan === 'BRONZE' ? 'ring-2 ring-amber-600/50' : ''}`}>
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2">Bronze Plan</CardTitle>
                            <div className="mt-4 flex items-baseline text-4xl font-extrabold text-white">
                                ₹100 <span className="ml-1 text-xl font-medium text-gray-500">/month</span>
                            </div>
                            <p className="text-amber-500 mt-2 font-medium">5 Questions Per Day</p>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-4 text-sm text-gray-300">
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-amber-500" /> 5 Questions Daily</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-amber-500" /> Invoice Email</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-amber-500" /> Bronze Badge</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-amber-500" /> Priority Posting</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            {currentPlan === 'BRONZE' ? (
                                <Button disabled className="w-full rounded-xl bg-amber-600/20 text-amber-500 border border-amber-600/30 py-6 font-bold">✓ Active Plan</Button>
                            ) : (
                                <Button onClick={() => handlePayment(100, 'BRONZE')} disabled={
                                    isProcessing !== null ||
                                    !paymentStatus.isPaymentWindowOpen
                                } className="w-full rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white py-6 font-bold shadow-lg transition-all">
                                    {!paymentStatus.isPaymentWindowOpen
                                        ? "Available at 10:00 AM IST"
                                        : isProcessing === "BRONZE"
                                            ? "Processing..."
                                            : "Upgrade to Bronze"}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>

                    {/* SILVER PLAN */}
                    <Card className={`relative bg-gradient-to-b from-[#1a1c23]/80 to-[#0A0A0A]/90 backdrop-blur-xl border border-gray-600/30 rounded-3xl flex flex-col transition-all duration-300 hover:border-gray-400/50 hover:shadow-[0_0_30px_rgba(156,163,175,0.15)] ${currentPlan === 'SILVER' ? 'ring-2 ring-gray-400/50' : ''}`}>
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">Silver Plan</CardTitle>
                            <div className="mt-4 flex items-baseline text-4xl font-extrabold text-white">
                                ₹300 <span className="ml-1 text-xl font-medium text-gray-500">/month</span>
                            </div>
                            <p className="text-gray-300 mt-2 font-medium">10 Questions Per Day</p>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-4 text-sm text-gray-300">
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-400" /> 10 Questions Daily</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-400" /> Silver Badge</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-400" /> Faster Access</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-400" /> Everything in Bronze</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            {currentPlan === 'SILVER' ? (
                                <Button disabled className="w-full rounded-xl bg-gray-600/20 text-gray-300 border border-gray-600/30 py-6 font-bold">✓ Active Plan</Button>
                            ) : (
                                <Button onClick={() => handlePayment(300, 'SILVER')} disabled={
                                    isProcessing !== null ||
                                    !paymentStatus.isPaymentWindowOpen
                                } className="w-full rounded-xl bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 text-white py-6 font-bold shadow-lg transition-all">
                                    {!paymentStatus.isPaymentWindowOpen
                                        ? "Available at 10:00 AM IST"
                                        : isProcessing === "SILVER"
                                            ? "Processing..."
                                            : "Upgrade to Silver"}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>

                    {/* GOLD PLAN */}
                    <Card className={`relative bg-gradient-to-b from-[#1f1a00] to-[#0A0A0A] backdrop-blur-xl border border-yellow-500/50 rounded-[2rem] flex flex-col xl:-mt-8 xl:mb-8 shadow-[0_0_40px_rgba(234,179,8,0.15)] transition-all duration-500 hover:shadow-[0_0_50px_rgba(234,179,8,0.25)] hover:-translate-y-2 z-10 ${currentPlan === 'GOLD' ? 'ring-2 ring-yellow-500 ring-offset-2 ring-offset-black' : ''}`}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black text-xs font-bold uppercase tracking-widest py-1.5 px-6 rounded-full shadow-lg whitespace-nowrap">Recommended</div>
                        <CardHeader className="pt-10">
                            <CardTitle className="text-2xl font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2 drop-shadow-md"><Crown className="w-6 h-6" /> Gold Plan</CardTitle>
                            <div className="mt-4 flex items-baseline text-5xl font-black text-white">
                                ₹1000 <span className="ml-1 text-xl font-medium text-yellow-500/70">/month</span>
                            </div>
                            <div className="mt-3 inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-sm font-bold">
                                <InfinityIcon className="w-4 h-4" /> Unlimited Questions
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 mt-4">
                            <ul className="space-y-5 text-sm text-gray-200">
                                <li className="flex items-center gap-3 font-medium"><div className="p-1 rounded-full bg-yellow-500/20"><Check className="w-4 h-4 text-yellow-500" /></div> Unlimited Questions</li>
                                <li className="flex items-center gap-3"><div className="p-1 rounded-full bg-yellow-500/20"><Check className="w-4 h-4 text-yellow-500" /></div> Gold Badge</li>
                                <li className="flex items-center gap-3"><div className="p-1 rounded-full bg-yellow-500/20"><Check className="w-4 h-4 text-yellow-500" /></div> Premium Access</li>
                                <li className="flex items-center gap-3"><div className="p-1 rounded-full bg-yellow-500/20"><Check className="w-4 h-4 text-yellow-500" /></div> Highest Priority</li>
                                <li className="flex items-center gap-3"><div className="p-1 rounded-full bg-yellow-500/20"><Check className="w-4 h-4 text-yellow-500" /></div> Everything Included</li>
                            </ul>
                        </CardContent>
                        <CardFooter className="pb-8">
                            {currentPlan === 'GOLD' ? (
                                <Button disabled className="w-full rounded-2xl bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 py-7 font-black text-lg">✓ Active Premium Plan</Button>
                            ) : (
                                <Button onClick={() => handlePayment(1000, 'GOLD')} disabled={
                                    isProcessing !== null ||
                                    !paymentStatus.isPaymentWindowOpen
                                } className="w-full rounded-2xl bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 hover:from-yellow-500 hover:to-yellow-300 text-black py-7 font-black text-lg shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] transition-all transform hover:scale-[1.02]">
                                    {!paymentStatus.isPaymentWindowOpen
                                        ? "Available at 10:00 AM IST"
                                        : isProcessing === "GOLD"
                                            ? "Processing..."
                                            : "Upgrade to Gold"}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;