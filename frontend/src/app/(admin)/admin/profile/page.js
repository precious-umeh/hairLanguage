"use client";

import server, { BASE_URL } from "@/app/(main)/utils/axiosClient";
import { useAuth } from "@/providers/admin/auth-provider";
import {
  Eye,
  EyeOff,
  LogOut,
  Settings,
  ShieldAlert,
  UserIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { DetailRow, SecurityButton } from "@/app/(main)/profile/page";
import DeleteModal from "../components/deleteModal";

export default function AdminProfilePage() {
  const { user, logout } = useAuth();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState("profile");
  const navTabs = [
    { id: "profile", label: "My Profile", icon: <UserIcon size={18} /> },
    { id: "security", label: "Security", icon: <Settings size={18} /> },
  ];

  const [isEditing, setIsEditing] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [timer, setTimer] = useState(120);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form States
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [otp, setOtp] = useState("");
  const [hasIntearctedWithProfile, setHasInteractedWithProfile] =
    useState(false);

  // Avatar States
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changePassword, setChangePassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasInteractedWithPass, setHasInteractedWithPass] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "security") {
      setActiveTab("security");
      setChangePassword(true);
      setHasInteractedWithPass(true);
    }
  }, [searchParams]);

  // Handle Password Change
  const handlePasswordChange = async function (e) {
    e.preventDefault();
    setIsChangingPassword(true);

    try {
      const response = await server.patch("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      toast.success(response.data.message || "Password Updated!");
      setCurrentPassword("");
      setNewPassword("");
      setChangePassword(false);
    } catch (error) {
      toast.error(error.reponse?.data?.message || "Failed to update password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Reset form when user data loads
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // Handle Logout
  const handleLogout = async function () {
    try {
      await logout();
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Handle file change
  const handleFileChange = function (e) {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Handle Profile Update
  const handleUpdate = async function (e) {
    e.preventDefault();
    setIsUpdating(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    if (selectedFile) formData.append("avatar", selectedFile);

    try {
      const response = await server.patch("/auth/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.emailChangePending) {
        setShowOtpModal(true);
        toast("Please check your email for a verification code.");
      } else {
        toast.success("Profile update successful!");
        setIsEditing(false);
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle OTP Verification
  const handleVerifyOtp = async function () {
    try {
      const response = await server.post("/auth/verify-otp", { email, otp });

      toast.success("Email verified and updated!");
      setShowOtpModal(false);
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP.");
    }
  };

  // Handle OTP Paste
  const handlePaste = function (e) {
    e.preventDefault();

    const data = e.clipboardData.getData("text");
    if (!/^\d{6}$/.test(data)) return;

    setOtp(data);
  };

  // Handle Resend OTP
  const handleResend = async function () {
    try {
      await server.post("/auth/resend-otp", { email });
      toast.success("New code sent!");
      setTimer(120);
    } catch (error) {
      console.log("Resend Error Detail:", error.response);
      toast.error(error.response?.data?.message || "Failed to resend OTP.");
    }
  };

  useEffect(() => {
    let interval;

    if (showOtpModal && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [showOtpModal, timer === 0]);

  const formatTime = function (seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle Cancel OTP - Email Verification Update
  const handleCancelOtp = async function () {
    try {
      await server.post("/auth/cancel-email-update");
      setShowOtpModal(false);
      setIsEditing(false);
      if (user) {
        setName(user.name);
        setEmail(user.email);
      }
      setTimer(120);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel update.");
    }
  };

  // Handle Acount Deletion
  const handleDelete = async function () {
    setIsDeleting(true);

    try {
      const response = await server.delete("/auth/delete-account");

      toast.success(response.data.message || "Account deleted successfully!");

      setItemToDelete(null);

      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Toaster position="top-left" />

      <header
        className="relative rounded-3xl bg-linear-to-r from-(--softAsh) to-white p-8 border 
          border-(--lightSilver) shadow-sm mb-10"
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-md">
              <img
                src={
                  previewUrl ||
                  `${BASE_URL}${user?.avatar}` ||
                  "/images/user.png"
                }
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            </div>

            <button
              onClick={() => {
                setIsEditing(true);
                setHasInteractedWithProfile(true);
              }}
              className="absolute -bottom-2 -right-2 bg-white p-2 rounded-lg shadow-md 
                border border-(--coolGrey) hover:text-(--accent) transition"
            >
              <Settings size={18} />
            </button>
          </div>

          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-(--textColor) mb-1 capitalize wrap-break-word">
              {user?.name}
            </h2>
            <p className="text-(--textMuted) mb-4 break-all">{user?.email}</p>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span
                className="px-3 py-1 bg-white/90 rounded-full text-[10px] font-bold uppercase 
                  tracking-widest border border-(--lightSilver)"
              >
                {user?.role}
              </span>
              <span
                className="px-3 py-1 bg-white/80 rounded-full text-[10px] font-bold uppercase 
                  tracking-widest border border-(--coolGrey)"
              >
                Joined{" "}
                {user.createdAt
                  ? new Date(user?.createdAt).toLocaleDateString("en-NG", {
                      month: "long",
                      year: "numeric",
                    })
                  : "N/A"}
              </span>
            </div>
          </div>

          <button
            onClick={() => handleLogout()}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl 
              font-semibold hover:bg-red-100 transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <div className="flex gap-4 border-b border-(--coolGrey) mb-8 overflow-x-auto scrollbar-hide">
        {navTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setHasInteractedWithPass(false);
              setHasInteractedWithProfile(false);
            }}
            className={`flex items-center gap-2 pb-4 px-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "text-(--textColor) border-b-2 border-(--accent)"
                : "text-(--textMuted) border-b-2 border-transparent hover:text-(--textColor)"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="min-h-75">
        {activeTab === "profile" && (
          <div className="fade-up">
            <div className="bg-white p-8 rounded-3xl border border-(--coolGrey) max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Personal Details</h3>

                {!isEditing && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setHasInteractedWithProfile(true);
                    }}
                    className="text-sm text-(--accent) font-bold"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <form
                  onSubmit={handleUpdate}
                  className={`space-y-4 ${hasIntearctedWithProfile ? "animate-zoom-in" : ""} `}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  <div className="flex items-center gap-4 p-4 bg-(--softAsh) rounded-2xl border border-dashed border-(--coolGrey)">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-sm shrink-0">
                      <img
                        src={previewUrl || `${BASE_URL}${user?.avatar}`}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-(--textColor)">
                        Profile Picture
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="text-xs text-(--accent) font-semibold hover:underline"
                      >
                        Change Profile Picture
                      </button>
                      {selectedFile && (
                        <span className="text-xs text-green-600 font-medium ml-2">
                          New image selected!
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-(--textMuted) uppercase">
                      Full Name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 mt-1 border rounded-xl outline-(--accent)"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-(--textMuted) uppercase">
                      Email Address
                    </label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 mt-1 border rounded-xl outline-(--accent)"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-6 py-2 bg-(--accent) text-white rounded-xl font-bold"
                    >
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setHasInteractedWithProfile(true);
                        setName(user.name);
                        setEmail(user.email);
                        setPreviewUrl(null); // Reset preview on cancel
                        setSelectedFile(null); // Reset file selection on cancel
                      }}
                      className="px-6 py-2 bg-(--softAsh) rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div
                  className={`space-y-4 ${hasIntearctedWithProfile ? "animate-zoom-in" : ""}`}
                >
                  <DetailRow
                    label="Full Name"
                    value={user?.name}
                    css="capitalize"
                  />
                  <DetailRow label="Email Address" value={user?.email} />
                  <DetailRow
                    label="Account Type"
                    value={user?.role}
                    css="capitalize"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="max-w-xl space-y-4 fade-up">
            <SecurityButton
              onClick={() => {
                setActiveTab("profile");
                setIsEditing(true);
              }}
              label="Edit Profile Information"
              desc="Update your name and avatar"
            />

            {changePassword ? (
              <form
                onSubmit={handlePasswordChange}
                className={`space-y-4 border border-(--coolGrey) p-5 rounded-2xl ${
                  hasInteractedWithPass ? "animate-zoom-in" : ""
                }`}
              >
                <div>
                  <label className="text-xs font-bold text-(--textMuted) uppercase">
                    Current Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-3 mt-1 border rounded-xl outline-(--accent)"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 mt-0.5 text-(--accent)
                       flex items-center justify-center"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-(--textMuted) uppercase">
                    New Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3 mt-1 border rounded-xl outline-(--accent)"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 mt-0.5 text-(--accent)
                       flex items-center justify-center"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-6 py-2 bg-(--accent) text-white rounded-xl font-bold disabled:opacity-50"
                  >
                    {isChangingPassword ? "Updating..." : "Update Password"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setChangePassword(false);
                      setHasInteractedWithPass(true);
                      setCurrentPassword("");
                      setNewPassword("");
                    }}
                    className="px-6 py-2 bg-(--softAsh) rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <SecurityButton
                onClick={() => {
                  setChangePassword(true);
                  setHasInteractedWithPass(true);
                }}
                label="Change Password"
                desc="Ensure your account is using a strong password"
                css={hasInteractedWithPass ? "animate-zoom-in" : ""}
              />
            )}

            <div className="pt-6">
              <button
                onClick={() => setItemToDelete("account")}
                className="flex items-center gap-3 w-full p-4 text-left rounded-2xl 
                 bg-red-50 text-red-700 hover-bg-red-100 transition border border-red-100"
              >
                <ShieldAlert size={20} />

                <div>
                  <p className="font-bold">Delete Admin Profile</p>
                  <p className="text-xs opacity-80">
                    Permanently deactivate your administrative access and remove
                    associated data.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        <DeleteModal
          isOpen={itemToDelete === "account"}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleDelete}
          loading={isDeleting}
          title="Delete your admin account?"
          description="This will permanently erase all your data and revoke your administrative 
            access. This action cannot be undone."
        />
      </div>

      {showOtpModal && (
        <div
          className="fixed inset-0 bg-(--textColor)/50 backdrop-blur-sm flex items-center 
            justify-center z-50 p-4"
        >
          <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-xl animate-zoom-in">
            <h3 className="text-2xl font-bold mb-2">Verify New Email</h3>
            <p className="text-(--textMuted) mb-6 text-sm">
              We sent a code to <b>{email}</b>. Enter it below to confirm your
              change.
            </p>

            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              onPaste={handlePaste}
              className="w-full p-4 border-2 border-(--lightSilver) rounded-2xl text-center 
                text-2xl font-bold tracking-widest outline-(--accent) mb-4"
            />

            <button
              onClick={handleVerifyOtp}
              className="w-full py-4 bg-(--accent) text-white rounded-2xl font-bold 
                hover:opacity-90 transition"
            >
              Verify & Update Email
            </button>

            <div className="text-sm mt-4 text-center">
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

            <button
              onClick={handleCancelOtp}
              className="w-full mt-2 py-2 text-(--textMuted) text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
