"use client";

import { Camera, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import server from "@/app/(main)/utils/axiosClient";
import { useAuth } from "@/providers/admin/auth-provider";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CreateAccount() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { userData, setUserData, preview, setPreview } = useAuth();
  const router = useRouter();

  const handleChange = function (e) {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleImageUpload = function (e) {
    const file = e.target.files[0];

    if (!file) return;

    if (file) {
      setUserData({ ...userData, avatar: file });
    }

    // clean old preview
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(URL.createObjectURL(file));

    // allow reselecting of same file
    e.target.value = "";
  };

  const handleSubmit = async function (e) {
    e.preventDefault();
    setLoading(true);

    // if (!userData.avatar) {
    //   toast.error("Please upload a profile picture!");
    // }

    const data = new FormData();
    data.append("name", userData.fullName);
    data.append("email", userData.email);
    data.append("password", userData.password);
    data.append("avatar", userData.avatar);

    try {
      const response = await server.post("/auth/register", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        toast.success("Verification code sent.");
        router.push(`/verify-otp?email=${userData.email}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration Failed!");
    } finally {
      setLoading(false);
    }

    console.log("Account created:", userData);
  };

  return (
    <section className="w-full min-h-screen flex justify-center items-center px-[5vw]">
      <Toaster position="top-left" />
      <div className="bg-(--lightSilver) max-w-150 m-auto w-full py-10 px-[5vw] rounded-lg shadow-md">
        <div className="fade-up space-y-6">
          <img
            src="/images/hairLanguageLogo/logo-black.png"
            className="w-30 mx-auto -mt-4"
          />

          <div className="space-y-6">
            <h2 className="font-medium text-3xl">Create Account</h2>

            <form onSubmit={handleSubmit} className="space-y-4 font-medium">
              <div className="text-xs ">
                <label
                  htmlFor="avatar"
                  className={`relative w-20 h-20 flex items-center justify-center rounded-full overflow-hidden cursor-pointer 
                    transition-all duration-300 ${
                      preview
                        ? "border-2 border-transparent"
                        : "border-2 border-(--accent)/40 border-dashed hover:border-(--accent)"
                    }`}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera size={22} className="text-(--accent)/70" />
                    // <span>Upload</span>
                  )}
                  <div
                    className={`absolute inset-0 bg-black/60 opacity-0 text-white flex items-center justify-center transition 
                    duration-200 ${preview ? "opacity-0 hover:opacity-100" : ""}`}
                  >
                    Change
                  </div>
                </label>

                <input
                  id="avatar"
                  type="file"
                  name="avatar"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="fullname-input" className="block text-sm">
                  Full Name
                </label>
                <input
                  id="fullname-input"
                  type="text"
                  name="fullName"
                  value={userData.fullName}
                  onChange={handleChange}
                  placeholder="E.g. John Doe"
                  required
                  className="inline-block w-full py-2 px-3 border-2 border-(--accent)/40 rounded-lg hover:border-(--accent) 
                    hover:shadow-md placeholder:text-[14px] transition-all duration-300 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="email-input" className="block text-sm">
                  Email Address
                </label>
                <input
                  id="email-input"
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  placeholder="E.g. johndoe@email.com"
                  required
                  className="inline-block w-full py-2 px-3 border-2 border-(--accent)/40 rounded-lg hover:border-(--accent) 
                  hover:shadow-md placeholder:text-[14px] transition-all duration-300 outline-none"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="password-input" className="block text-sm">
                    Password
                  </label>
                  <span className="text-xs cursor-pointer hover:underline underline-offset-4">
                    Forgot password?
                  </span>
                </div>

                <div className="relative flex items-center justify-center">
                  <input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={userData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="inline-block w-full py-2.5 px-3 border-2 border-(--accent)/40 rounded-lg hover:border-(--accent) 
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
                  <div className="">
                    <Loader2 size={18} className="animate-spin" />
                  </div>
                ) : (
                  "Sign up"
                )}
              </button>
            </form>

            <Link href="/login">
              <p className="text-center">
                Have an account?{" "}
                <span className="underline underline-offset-4 font-medium ">
                  Log in
                </span>
              </p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}



