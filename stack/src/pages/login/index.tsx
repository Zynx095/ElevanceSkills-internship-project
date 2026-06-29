import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/AuthContext";
import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useLanguage } from "@/lib/LanguageContext";
import { Mail, Lock, Key, ShieldCheck } from "lucide-react";
import axiosInstance from "@/lib/axiosinstance";

export default function LoginPage() {
  const router = useRouter();
  const { Login, loading, setUser } = useAuth();
  const { translate } = useLanguage();
  
  const [form, setform] = useState({ email: "", password: "" });
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");

  const handleChange = (e: any) => {
    setform({ ...form, [e.target.id]: e.target.value });
  };

  const handlesubmit = async (e: any) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error(translate("ALL Fields are required"));
      return;
    }
    try {
      const result = await Login(form);
      if (result?.otpRequired) {
        setShowOTP(true);
        setOtpEmail(result.email);
        return;
      }
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  const verifyOTP = async () => {
    try {
      const res = await axiosInstance.post("/user/verify-login-otp", {
        email: otpEmail,
        otp,
      });
      const { data, token } = res.data;
      localStorage.setItem("user", JSON.stringify({ ...data, token }));
      setUser({ ...data, token });
      toast.success(translate("Login Successful"));
      router.push("/");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || translate("OTP verification failed")
      );
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vh] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20">
              Y
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Yukith<span className="text-purple-500">Hub</span>
            </span>
          </Link>
        </div>

        <form onSubmit={handlesubmit}>
          <Card className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 shadow-2xl rounded-3xl p-6 sm:p-8">
            <CardHeader className="space-y-2 text-center pb-6">
              <CardTitle className="text-2xl font-bold text-white tracking-tight">
                {translate("Log in to your account")}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {translate("Enter your email and password")}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-5 p-0">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-gray-400">{translate("Email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-600" />
                  <Input
                    id="email"
                    type="email"
                    className="bg-[#111] border-white/10 text-white rounded-xl pl-10 focus-visible:ring-purple-500"
                    placeholder={translate("m@example.com")}
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-gray-400">{translate("Password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-600" />
                  <Input
                    id="password"
                    type="password"
                    className="bg-[#111] border-white/10 text-white rounded-xl pl-10 focus-visible:ring-purple-500"
                    value={form.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* OTP Section */}
              {showOTP && (
                <div className="mt-6 p-5 bg-white/5 rounded-2xl border border-purple-500/30 space-y-4">
                  <Label className="text-xs text-purple-300 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> {translate("Enter OTP")}
                  </Label>
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
                      type="button"
                      onClick={verifyOTP} 
                      className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl text-white h-12 font-semibold"
                    >
                      {translate("Verify OTP")}
                    </Button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl py-6 font-semibold transition-all shadow-lg shadow-purple-900/20"
              >
                {loading ? translate("loading") : translate("Log in")}
              </Button>

              <div className="text-center text-sm space-y-3 pt-2">
                <div>
                  <Link href="/forgot-password" className="text-purple-400 hover:underline font-medium">
                    {translate("Forgot your password?")}
                  </Link>
                </div>
                <div className="text-gray-500">
                  {translate("Don't have an account?")}{" "}
                  <Link href="/signup" className="text-purple-400 hover:underline font-medium">
                    {translate("Sign up")}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}