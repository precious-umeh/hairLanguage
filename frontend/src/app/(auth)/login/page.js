"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/providers/admin/auth-provider";
import { useRouter } from "next/navigation";
// import server from "@/app/(main)/utils/axiosClient";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = function (e) {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleSubmit = async function (e) {
    e.preventDefault();
    setLoading(true);

    try {
      // Manually grab the sessionId from localStorage
      // We use the same key we defined in the CartProvider: "hair_language_session"
      const sessionId =
        typeof window !== "undefined"
          ? localStorage.getItem("hair_language_session")
          : null;

      // Attach it to the login data
      const loginPayload = {
        ...loginData,
        sessionId, // This will be the UUID string or null
      };

      const result = await login(loginPayload, "user");

      if (!result.success) {
        if (result.needsVerification) {
          toast.error(result.message);
          router.push(`/verify-otp?email=${loginData.email}`);
        } else {
          toast.error(result.message);
        }
      } else {
        toast.success("Login Successful!");
        router.push("/profile");

        setLoginData({
          email: "",
          password: "",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex justify-center items-center px-[5vw]">
      <Toaster position="top-left" />
      <div className="bg-(--lightSilver) max-w-150 m-auto w-full py-10 px-[5vw] rounded-lg shadow-md ">
        <div className="fade-up space-y-6">
          <img
            src="/images/hairLanguageLogo/logo-black.png"
            className="w-30 mx-auto -mt-4"
          />

          <div className="space-y-6">
            <h2 className="font-medium text-3xl">Login</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor="email-input"
                  className="block text-sm font-medium"
                >
                  Email Address
                </label>
                <input
                  id="email-input"
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  required
                  className="inline-block w-full py-2 px-3 border-2 border-(--accent)/40 rounded-lg hover:border-(--accent) 
                hover:shadow-md placeholder:text-[14px] transition-all duration-300 outline-none"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm font-medium">
                  <label htmlFor="password-input" className="block">
                    Password
                  </label>
                  <span className="text-xs block cursor-pointer hover:underline underline-offset-4">
                    Forgot password?
                  </span>
                </div>

                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password-input"
                    name="password"
                    value={loginData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="block w-full py-2.5 px-3 border-2 border-(--accent)/40 rounded-lg hover:border-(--accent)
                    hover:shadow-md placeholder:text-[14px] transition-all duration-300 outline-none"
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
                disabled={loading}
                className={`flex items-center justify-center w-full py-2 px-3 font-medium text-white bg-(--accent) rounded-lg md:hover:shadow-md 
                transition-all duration-300 ${loading ? "disabled:opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {loading ? (
                  <div>
                    <Loader2 size={18} className="animate-spin" />
                  </div>
                ) : (
                  "Log in"
                )}
              </button>
            </form>

            <Link href="/create-account">
              <p className="text-center">
                Don't have an account yet?{" "}
                <span className="underline underline-offset-4 font-medium ">
                  Sign up
                </span>
              </p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// try {
//   const response = await server.post("/auth/login", loginData);

//   if (response.status === 200) {
//     localStorage.setItem("token", response.data.token);
//     toast.success("Login Successful!");
//   }
// } catch (error) {
//   toast.error(error.response?.data?.message || "Login Failed!");
// }
