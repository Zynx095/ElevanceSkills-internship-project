import React, { useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "react-toastify";
import { useLanguage } from "@/lib/LanguageContext";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  Shield,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ForgotPassword = () => {
  const { translate } = useLanguage();
  const router = useRouter();


  // Original states preserved
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");

  // New states for enhanced UX flow
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset
  const [hasActiveOtp, setHasActiveOtp] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);
  const [isLoadingReset, setIsLoadingReset] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // --- Password Strength Logic ---
  const pwdReqs = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword)
  };
  const strengthScore = Object.values(pwdReqs).filter(Boolean).length;
  const strengthLabel = strengthScore <= 1 ? "Weak" : strengthScore <= 3 ? "Medium" : "Strong";
  const strengthColor = strengthScore <= 1 ? "bg-red-500" : strengthScore <= 3 ? "bg-yellow-500" : "bg-green-500";

  // --- Enhanced API Handlers ---

  const handleForgotPassword = async () => {
    if (!email && !phoneNumber) return;
    setIsLoadingEmail(true);
    try {
      const res = await axiosInstance.post("/user/forgot-password", { email });
      if (res.data?.otpRequired || res.data) {
        setHasActiveOtp(false);
        setShowOtpInput(true);
        setStep(2);
        setTimeout(() => document.getElementById("otp-input")?.focus(), 100);
      }
    } catch (error: any) {
      const errData = error.response?.data;

      // Handle the new custom backend response
      if (errData?.otpAlreadySent) {
        setHasActiveOtp(true);
        setStep(2);
        setShowOtpInput(true);
        setTimeout(() => document.getElementById("otp-input")?.focus(), 100);
      } else {
        toast.error(errData?.message || translate("Failed to send verification code."));
      }
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const verifyForgotPasswordOTP = async () => {
    if (!otp) return;
    setIsLoadingOtp(true);
    try {
      const res = await axiosInstance.post("/user/verify-forgot-password-otp", { email, otp });
      toast.success(translate("Password sent to email"));

      // Preserve generated password logic if backend returns it
      if (res.data?.generatedPassword || res.data?.newPassword) {
        setGeneratedPassword(res.data.generatedPassword || res.data.newPassword);
      }

      setStep(3);
    } catch (error: any) {
      toast.error(error.response?.data?.message || translate("OTP verification failed"));
    } finally {
      setIsLoadingOtp(false);
    }
  };

  const handleFinalReset = () => {
    setIsLoadingReset(true);
    setTimeout(() => {
      setIsLoadingReset(false);
      toast.success(translate("Password updated successfully"));
      router.push("/login");
    }, 1200);
  };

  // --- Animation Variants ---
  const slideVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3, ease: "easeIn" } }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans text-gray-200 selection:bg-purple-500/30">

      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vh] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vh] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[480px] relative z-10"
      >
        <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 shadow-2xl shadow-purple-900/10 rounded-3xl overflow-hidden p-8 sm:p-10 relative">

          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

          {/* Logo Header */}
          <div className="flex flex-col items-center justify-center mb-8">
            <Link href="/" className="flex items-center gap-3 group mb-6 cursor-pointer">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-[0_0_20px_rgba(147,51,234,0.4)] group-hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] transition-all duration-300">
                <span className="text-white font-bold font-mono text-xl tracking-tighter">Y</span>
              </div>
              <span className="font-semibold text-2xl tracking-tight text-white">
                Yukith<span className="text-purple-500/80">Hub</span>
              </span>
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: EMAIL SECTION */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center space-y-2 mb-8">
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    {translate("Forgot Password")}
                  </h1>
                  <p className="text-sm text-gray-400">
                    {translate("Enter your registered email address and we'll send a verification code.")}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative flex items-center bg-[#111] border border-white/10 rounded-xl overflow-hidden focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/50 transition-all duration-300">
                    <div className="pl-4 pr-2 text-gray-500"><Mail className="w-5 h-5" /></div>
                    <Input
                      type="email"
                      placeholder={translate("Enter Email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-transparent border-0 text-white focus-visible:ring-0 px-2 py-6 text-base"
                    />
                  </div>

                  <div className="relative flex items-center bg-[#111] border border-white/10 rounded-xl overflow-hidden focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/50 transition-all duration-300">
                    <div className="pl-4 pr-2 text-gray-500"><Phone className="w-5 h-5" /></div>
                    <Input
                      type="text"
                      placeholder="Phone Number (Optional)"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="bg-transparent border-0 text-white focus-visible:ring-0 px-2 py-6 text-base"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleForgotPassword}
                  disabled={isLoadingEmail || (!email && !phoneNumber)}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                >
                  {isLoadingEmail ? <Loader2 className="w-5 h-5 animate-spin" /> : translate("Generate OTP")}
                </Button>
              </motion.div>
            )}

            {/* STEP 2: OTP VERIFICATION */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                {hasActiveOtp ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-900/10 border border-amber-500/30 rounded-2xl p-5 shadow-[0_0_20px_rgba(245,158,11,0.1)] mb-6"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                      <div className="p-3 bg-amber-500/20 rounded-full shrink-0">
                        <AlertTriangle className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="text-amber-500 font-bold text-lg leading-tight">{translate("Verification Code Already Sent")}</h3>
                      </div>
                    </div>
                    <p className="text-amber-200/70 text-sm leading-relaxed mb-5">
                      {translate("A password reset code has already been sent to your registered email. Please check your inbox or wait until the current code expires before requesting another one.")}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => document.getElementById('otp-input')?.focus()}
                        className="bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl flex-1 shadow-lg shadow-amber-500/20"
                      >
                        {translate("Continue Verification")} <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button
                        onClick={() => { setStep(1); setHasActiveOtp(false); setEmail(""); setPhoneNumber(""); }}
                        variant="outline"
                        className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400 bg-transparent rounded-xl flex-1"
                      >
                        {translate("Request Again Later")}
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center space-y-4 mb-8">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-purple-500/20">
                      <ShieldCheck className="w-8 h-8 text-purple-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">{translate("Verify your identity")}</h1>
                    <p className="text-sm text-gray-400 max-w-[280px] mx-auto leading-relaxed">
                      {translate("Enter the six digit code sent to your email.")}
                    </p>
                  </div>
                )}

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-6">
                  <div className="relative">
                    <Input
                      id="otp-input"
                      type="text"
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="bg-[#111] border-white/10 text-white text-center text-2xl tracking-[0.5em] h-14 rounded-xl focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 transition-all shadow-inner font-mono font-bold"
                      autoFocus
                    />
                  </div>

                  <Button
                    onClick={verifyForgotPasswordOTP}
                    disabled={isLoadingOtp || otp.length < 4}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                  >
                    {isLoadingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : translate("Verify OTP")}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: RESET PASSWORD */}
            {/* STEP 3: PASSWORD RESET SUCCESS */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8 text-center"
              >
                {/* Success Icon */}
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                  </div>
                </div>

                {/* Heading */}
                <div className="space-y-3">
                  <h1 className="text-3xl font-bold text-white">
                    {translate("Password Reset Successful")}
                  </h1>

                  <p className="text-gray-400 text-sm leading-relaxed">
                    {translate(
                      "A new password has been generated and sent to your registered email address."
                    )}
                  </p>
                </div>

                {/* Success Box */}
                <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6">
                  <Mail className="mx-auto w-10 h-10 text-green-400 mb-4" />

                  <p className="text-green-300 font-semibold text-lg">
                    {translate("Check your email for your new password")}
                  </p>

                  <p className="text-gray-400 text-sm mt-2">
                    {translate(
                      "Use the password received in your email to log in to your account."
                    )}
                  </p>
                </div>

                {/* Login Button */}
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-white font-semibold"
                >
                  {translate("Go to Login")}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Centered Bottom Link */}
          <div className="mt-8 flex justify-center border-t border-white/5 pt-6">
            <Link
              href="/login"
              className="group flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="relative">
                {translate("Back to Login")}
                <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-purple-400 group-hover:w-full transition-all duration-300" />
              </span>
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;