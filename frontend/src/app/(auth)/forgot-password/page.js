"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import server from "@/app/(main)/utils/axiosClient";

export function ForgotPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Determin where "Back to Login" should go based on the "role" query param
  const role = searchParams.get("role") || "user";
  const loginPath = role === "admin" ? "/admin/login" : "/login";

  const [step, setStep] = useState(1); // 1. Email, 2. Reset
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Countdown State
  const [countdown, setCountdown] = useState(0);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });

  // Handle countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = function (seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Shared function to trigger the forgotPassword API
  const triggerOtpRequest = async (isResend = false) => {
    if (isResend) setResending(true);
    setLoading(true);

    try {
      await server.post("/auth/forgot-password", { email: formData.email });

      toast.success("Verification code sent!");

      setCountdown(120);

      if (!isResend) setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send code.");
    } finally {
      setResending(false);
      setLoading(false);
    }
  };

  // Step 1: Reset OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    triggerOtpRequest(false);
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await server.post("/auth/reset-password", formData);

      toast.success("Password reset successful!");

      router.push(loginPath);
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset Failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex justify-center items-center px-[5vw]">
      <Toaster position="top-left" />

      <div className="bg-(--lightSilver) max-w-150 m-auto w-full py-10 px-[5vw] rounded-lg shadow-md">
        <div className="fade-up space-y-6">
          <img
            src="/images/hairLanguageLogo/logo-black.png"
            alt="Logo"
            className="w-30 mx-auto -mt-4"
          />

          <div
            onClick={() => (step === 2 ? setStep(1) : router.push(loginPath))}
            className="flex items-center gap-2 text-(--accent) cursor-pointer hover:underline"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">
              Back to {step === 2 ? "Email" : "Login"}
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="font-medium text-3xl">
              {step === 1 ? "Forgot Password" : "Reset Password"}
            </h2>

            <p className="text-sm text-(--textMuted)">
              {step === 1
                ? "Enter your email and we'll send you a code to reset your password."
                : `We sent a code to ${formData.email}. Enter the code and your new password.`}
            </p>
          </div>

          {step === 1 ? (
            // ===== STEP 1 FORM =====
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  required
                  className="inline-block w-full py-2 px-3 border-2 border-(--accent)/40 rounded-lg outline-none hover:border-(--accent) transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center w-full py-2 px-3 font-medium text-white bg-(--accent) rounded-lg hover:shadow-md transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Send Code"
                )}
              </button>
            </form>
          ) : (
            // ===== STEP 2 FORM =====
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="otp" className="block text-sm font-medium">
                  Verification Code
                </label>

                <input
                  id="otp"
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="000000"
                  required
                  className="inline-block w-full py-2 px-3 border-2 border-(--accent)/40 rounded-lg outline-none text-center font-bold tracking-widest"
                />

                {/* ===== RESEND BUTTON WITH COUNTDOWN ===== */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    disabled={countdown > 0 || resending}
                    onClick={() => triggerOtpRequest(true)}
                    className="text-xs font-semibold flex items-center gap-1 text-(--accent) disabled:text-(--textMuted) hover:underline disabled:no-underline"
                  >
                    {resending ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <RefreshCw size={12} />
                    )}

                    {countdown > 0
                      ? `Resend code in ${formatTime(countdown)}`
                      : "Resend code"}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium"
                >
                  New Password
                </label>

                <div className="relative flex items-center">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="inline-block w-full py-2 px-3 border-2 border-(--accent)/40 rounded-lg outline-none hover:border-(--accent) transition-all"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-(--accent)/50"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center w-full py-2 px-3 font-medium text-white bg-(--accent) rounded-lg hover:shadow-md transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default function ForgotPasswordPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen flex justify-center items-center">
          <Loader2 className="animate-spin text-(--accent)" size={32} />
        </div>
      }
    >
      <ForgotPassword />
    </Suspense>
  );
}
