"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/providers/admin/auth-provider";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const { login, verify2FALogin } = useAuth();

  const [is2FARequired, setIs2FARequired] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const router = useRouter();

  const handleFormChange = function (e) {
    const { name, value } = e.target;
    setLoginForm({ ...loginForm, [name]: value });
  };

  const handleFormSubmit = async function (e) {
    e.preventDefault();

    try {
      const result = await login(loginForm, "admin");

      // Handle 2FA requirement
      if (result.require2FA) {
        setIs2FARequired(true);
        setTempUserId(result.userId);
        toast.success("Password verified. Enter 2FA code.");
        return;
      }

      if (result.success) {
        toast.success("Login successful!");
        router.push("/admin/dashboard");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed!");
    }

    setLoginForm({ email: "", password: "" });
  };

  const handle2FAVerify = async function (e) {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const result = await verify2FALogin(tempUserId, otpCode);

      if (result.success) {
        toast.success("Authentication successful.");
        router.push("/admin/dashboard");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed!");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex items-center justify-center px-[5vw]">
      <Toaster position="top-left" />
      <div className="bg-(--lightSilver) max-w-150 m-auto w-full py-10 px-[5vw] rounded-lg shadow-md">
        <div className="fade-up space-y-6">
          <img
            src="/images/hairLanguageLogo/logo-black.png"
            className="w-30 mx-auto -mt-4"
          />

          <h2 className="text-lg font-bold text-(--textMuted) tracking-widest text-center italic">
            Admin Control Panel
          </h2>

          <div className="space-y-6">
            {/* <h3 className="font-medium text-3xl">Login</h3> */}

            {!is2FARequired ? (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label
                    htmlFor="email-input"
                    className="text-sm font-medium block"
                  >
                    Email Address
                  </label>

                  <input
                    id="email-input"
                    type="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleFormChange}
                    placeholder="admin@mail.com"
                    required
                    className="inline-block w-full py-2 px-3 border-2 border-(--accent)/40 rounded-lg 
                    hover:border-(--accent) hover:shadow-md placeholder:text-[14px] transition-all 
                    duration-300 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between font-medium text-sm">
                    <label htmlFor="password-input" className="block">
                      Password
                    </label>

                    <Link href="/forgot-password?role=admin">
                      <span className="text-xs block cursor-pointer hover:underline underline-offset-4">
                        Forgot password?
                      </span>
                    </Link>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      id="password-input"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={loginForm.password}
                      onChange={handleFormChange}
                      placeholder="••••••••"
                      required
                      className="inline-block w-full py-2 px-3 border-2 border-(--accent)/40 rounded-lg 
                      hover:border-(--accent) hover:shadow-md placeholder:text-[14px] transition-all 
                      duration-300 outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-(--accent)/50 flex items-center justify-center p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className=" w-full py-2 px-3 font-medium text-white bg-(--accent) rounded-lg cursor-pointer hover:shadow-md 
                  transition-all duration-300"
                >
                  Log in
                </button>
              </form>
            ) : (
              <form
                onSubmit={handle2FAVerify}
                className="fade-up space-y-6 text-center"
              >
                <div className="space-y-2">
                  <p className="text-sm font-bold">Two-Factor Authentication</p>
                  <p className="text-xs text-(--textMuted)">
                    Enter the 6-digit code from your Google Authenticator app.
                  </p>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="000000"
                  autoFocus
                  required
                  className="w-full py-3 px-4 text-center text-3xl font-black tracking-[0.5em] border-2 
                    border-(--accent)/40 rounded-lg outline-(--accent) transition-all"
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIs2FARequired(false)}
                    className="flex-1 py-2 text-sm font-medium text-(--textMuted) hover:underline"
                  >
                    Back to Login
                  </button>

                  <button
                    type="submit"
                    disabled={otpCode.length !== 6 || isVerifying}
                    className="flex-2 py-2 px-3 font-medium text-white bg-(--accent) rounded-lg cursor-pointer hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? "Verifying..." : "Verify Code"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
