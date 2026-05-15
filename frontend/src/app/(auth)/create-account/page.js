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

{
  // // login automatically
  // const loginResult = await login(
  //   { email: userData.email, password: userData.password },
  //   "user",
  // );
  // if (loginResult.success) {
  //   router.push("/profile");
  // }
  /* {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full border-2 border-(--accent)/40 border-dashed flex items-center justify-center">
                    Upload
                  </div>
                )}

                <input
                  id="avatar-upload"
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file:mr-10 file:py-2 file:px-4 file:rounded-full file:border-2 file:border-(--accent)/40 
                  file:hover:border-(--accent) file:hover:shadow-md file:transition-all file:duration-300"
                /> */
}
// "use client";

// import { useState } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// export default function Signup() {
//   const router = useRouter();

//   // Axios instance for backend requests
//   const server = axios.create({
//     baseURL: "http://127.0.0.1:5500",
//   });

//   // Form state
//   const [formData, setFormData] = useState({
//     name: "",
//     avatar: "",
//     email: "",
//     password: "",
//   });

//   // Handle input changes (text + file)
//   const handleChange = (e) => {
//     if (e.target.type === "file") {
//       // Store selected file
//       setFormData({
//         ...formData,
//         [e.target.name]: e.target.files[0],
//       });
//     } else {
//       // Store text input value
//       setFormData({
//         ...formData,
//         [e.target.name]: e.target.value,
//       });
//     }
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Create form data for sending to backend
//     const data = new FormData();
//     data.append("name", formData.name);
//     data.append("avatar", formData.avatar);
//     data.append("email", formData.email);
//     data.append("password", formData.password);

//     try {
//       // Send signup request
//       const response = await server.post("/signup", data);

//       // Save auth token
//       localStorage.setItem("token", response.data.token);

//       // Redirect to profile page
//       router.push("/profile");
//     } catch (error) {
//       // Log error if request fails
//       console.log(error);
//     }
//   };

//   return (
//     // Main wrapper
//     <div className="flex items-center justify-center min-h-screen bg-[#f7f7f5] p-4 selection:bg-green-100">

//       {/* Card container */}
//       <section className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-xl border border-white">

//         {/* Left image section (hidden on small screens) */}
//         <div className="md:w-1/2 hidden md:block overflow-hidden bg-neutral-100">
//           <img
//             className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
//             src="/IMG_1314.jpg"
//             alt="Signup Visual"
//           />
//         </div>

//         {/* Right form section */}
//         <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center">

//           {/* Header */}
//           <div className="mb-8 text-center md:text-left">
//             <h2 className="text-3xl font-serif text-neutral-900 uppercase mb-2">
//               Join Us
//             </h2>
//             <p className="text-neutral-400 text-sm font-light">
//               Create your Karomart account.
//             </p>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="flex flex-col gap-5">

//             {/* Full Name */}
//             <div className="flex flex-col gap-1">
//               <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">
//                 Full Name
//               </label>
//               <input
//                 className="w-full mt-1 bg-neutral-50 border border-neutral-200 rounded-xl p-4 outline-none focus:border-green-700 text-[16px] transition-all"
//                 type="text"
//                 name="name"
//                 onChange={handleChange}
//                 placeholder="Enter your name"
//                 required
//               />
//             </div>

//             {/* Avatar Upload */}
//             <div className="flex flex-col gap-1">
//               <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">
//                 Avatar
//               </label>
//               <input
//                 className="mt-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-bold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
//                 type="file"
//                 name="avatar"
//                 accept="image/*"
//                 onChange={handleChange}
//               />
//             </div>

//             {/* Email */}
//             <div className="flex flex-col gap-1">
//               <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">
//                 Email Address
//               </label>
//               <input
//                 className="w-full mt-1 bg-neutral-50 border border-neutral-200 rounded-xl p-4 outline-none focus:border-green-700 text-[16px] transition-all"
//                 type="email"
//                 name="email"
//                 onChange={handleChange}
//                 placeholder="email@example.com"
//                 required
//               />
//             </div>

//             {/* Password */}
//             <div className="flex flex-col gap-1">
//               <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">
//                 Password
//               </label>
//               <input
//                 className="w-full mt-1 bg-neutral-50 border border-neutral-200 rounded-xl p-4 outline-none focus:border-green-700 text-[16px] transition-all"
//                 type="password"
//                 name="password"
//                 onChange={handleChange}
//                 placeholder="••••••••"
//                 required
//               />
//             </div>

//             {/* Submit button */}
//             <button
//               type="submit"
//               className="mt-4 bg-black text-white py-5 text-[11px] font-bold uppercase tracking-[0.3em] rounded-xl hover:bg-green-800 transition shadow-lg active:shadow-inner"
//             >
//               Sign Up
//             </button>

//             {/* Login link */}
//             <div>
//               <Link href="/login">
//                 <p className="text-center text-xs text-neutral-400 uppercase tracking-widest mt-2">
//                   Already have an account?{" "}
//                   <span className="text-green-700 font-bold hover:underline">
//                     Log in
//                   </span>
//                 </p>
//               </Link>
//             </div>

//           </form>
//         </div>
//       </section>
//     </div>
//   );
// }
