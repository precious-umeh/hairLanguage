"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import server from "@/app/(main)/utils/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/providers/admin/auth-provider";

export default function VerifyOtp() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(120);
  const { setAuthData, clearRegistrationData } = useAuth();

  // Handle Auto Focus Jump For The Inputs
  const handleChange = function (element, index) {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = function (e, index) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move focus to previous input if current is empty
      e.target.previousSibling.focus();
    }
  };

  // Handle OTP Paste
  const handlePaste = function (e) {
    const data = e.clipboardData.getData("text");
    if (!/^\d{6}$/.test(data)) return; // Only allow 6 digits

    const pasteData = data.split("");
    setOtp(pasteData);

    // Focus the last input
    const inputs = e.target.parentElement.querySelectorAll("input");
    inputs[5].focus();
  };

  // Handle OTP Verification
  const handleVerify = async function (e) {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) return toast.error("Please enter full code");

    setLoading(true);

    try {
      const response = await server.post("/auth/verify-otp", {
        email,
        otp: otpString,
      });

      if (response.status === 200) {
        toast.success("Identity Verified!");

        // login automatically
        const { user, token } = response.data;
        setAuthData(user, token);
        clearRegistrationData();

        router.replace("/profile");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Resend
  const handleResend = async function () {
    if (!email) {
      toast.error("Email not found! Please try signing up again.");
      return;
    }

    try {
      console.log("Attempting resend to:", email);
      await server.post("/auth/resend-otp", { email });
      toast.success("New Code Sent!");
      setTimer(120);
    } catch (error) {
      console.log("Resend Error Detail:", error.response);
      toast.error(error.response?.data?.message || "Try again later");
    }
  };

  // Timer Logic
  useEffect(() => {
    let interval;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timer === 0]);

  const formatTime = function (seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <section className="w-full min-h-screen flex justify-center items-center px-[5vw]">
      <Toaster position="top-left" />

      <div className="bg-(--lightSilver) max-w-150 m-auto w-full py-10 px-[5vw] rounded-lg shadow-md">
        <div className="fade-up space-y-8 text-center">
          <Link
            href="/auth/register"
            className="flex items-center text-xs text-(--accent)/60 hover:text-(--accent) transition-all"
          >
            <ArrowLeft size={14} className="mr-1" /> Back to Sign up
          </Link>

          <div className="bg-(--accent)/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Mail className="text-(--accent)" size={28} />
          </div>

          <div className="space-y-2">
            <h2 className="font-medium text-3xl">Verify Email</h2>
            <p className="text-sm text-(--textMuted)">
              We sent a 6-digit code to{" "}
              <span className="text-(--accent) font-semibold">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-8">
            <div className="flex justify-center gap-2 md:gap-4">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-10 h-12 md:w-14 md:h-16 text-center text-2xl font-bold border-2 
                    border-(--accent)/20 rounded-lg outline-none focus:border-(--accent) 
                    focus:shadow-md transition-all duration-300"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-3 font-medium text-white bg-(--accent) rounded-lg 
                cursor-pointer hover:shadow-md transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Account"}
            </button>
          </form>

          <div className="text-sm">
            <p className="text-(--textMuted)">
              Didn't receive the code?{" "}
              <button
                onClick={handleResend}
                disabled={timer > 0}
                className={`font-medium underline underline-offset-4 ${
                  timer > 0
                    ? "text-(--textMuted)/70 cursor-not-allowed"
                    : "text-(--accent) cursor-pointer"
                }`}
              >
                {timer > 0 ? `Resend in ${formatTime(timer)}` : "Resend Code"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
