"use client";

import { useAuth } from "@/providers/admin/auth-provider";
import {
  Calendar,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Package,
  Settings,
  ShieldAlert,
  UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import server, { BASE_URL } from "../utils/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import DeleteModal from "@/app/(admin)/admin/components/deleteModal";
import { formatPrice } from "../utils/formatPrice";

export default function ProfilePage() {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();

  const [consultations, setConsultations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [timer, setTimer] = useState(120);
  const [itemToDelete, setItemToDelete] = useState({ type: null, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Form States
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [otp, setOtp] = useState("");

  const [hasInteractedWithProfile, setHasInteractedWithProfile] =
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

  // Handle Password Change
  const handlePasswordChange = async function (e) {
    e.preventDefault();
    setIsChangingPassword(true);

    try {
      const response = await server.patch("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      toast.success(response.data.message || "Password updated!");
      setCurrentPassword("");
      setNewPassword("");
      setChangePassword(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update password.",
      );
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

  // Handle file change
  const handleFileChange = function (e) {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Handle profile update
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
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle OTP Verification
  const handleVerifyOtp = async function () {
    try {
      const response = await server.post("/auth/verify-otp", {
        email,
        otp,
      });

      toast.success("Email verified and updated!");
      setShowOtpModal(false);
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
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
  }, [showOtpModal, timer]);

  const formatTime = function (seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle Cancel OTP
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

  // =======================================
  // Fetch and Sync Orders and Consultations of the User

  const fetchData = useCallback(
    async function () {
      if (!isAuthenticated || !user) return;
      setIsDataLoading(true);

      try {
        const [orderRes, bookingRes] = await Promise.all([
          server.get("/api/orders/my-orders"),
          server.get("/api/my-consultations"),
        ]);

        setOrders(orderRes.data.data || []);
        setConsultations(bookingRes.data.bookings || []);
      } catch (error) {
        console.error("Fetch Error:", error);
        toast.error(
          error.response?.data?.message || "Error fetching activity data",
        );
      } finally {
        setIsDataLoading(false);
      }
    },
    [isAuthenticated, user],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =======================================
  // Delete Handler

  const handleConfirmDelete = async function () {
    const { type, id } = itemToDelete;

    if (!type || !id) return;

    setIsDeleting(true);

    try {
      // ===== ACCOUNT DELETE =====
      if (type === "account") {
        const response = await server.delete("/auth/delete-account");

        toast.success(response.data.message || "Account deleted successfully.");

        setItemToDelete({ type: null, id: null });

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);

        return;
      }

      // ===== CONSULTATION DELETE =====
      if (type === "consultation") {
        await server.patch(`/api/my-consultations/${id}/hide`);

        setConsultations((prev) => prev.filter((item) => item._id !== id));

        toast.success("Consultation removed from history.");
      }

      // ===== ORDER DELETE =====
      if (type === "order") {
        await server.patch(`api/orders/${id}/hide`);

        setOrders((prev) => prev.filter((item) => item._id !== id));

        toast.success("Order removed from history.");
      }

      setItemToDelete({ type: null, id: null });
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error(error.response?.data?.message || "Delete action failed.");
    } finally {
      setIsDeleting(false);
    }
  };

  const navTabs = [
    { id: "profile", label: "My Profile", icon: <UserIcon size={18} /> },
    { id: "orders", label: "Orders", icon: <Package size={18} /> },
    {
      id: "consultations",
      label: "Consultations",
      icon: <Calendar size={18} />,
    },
    { id: "security", label: "Security", icon: <Settings size={18} /> },
  ];

  // Redirect if not logged in
  // useEffect(() => {
  //   if (!loading && !isAuthenticated) {
  //     router.replace("/login");
  //   }
  // }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!loading) {
      // Redirect if not logged or not user
      if (!isAuthenticated || user?.role !== "user") {
        router.replace("/login");
        return;
      }
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 items-center justify-center text-(--textMuted) h-[60vh]">
        <Loader2 size={40} className="animate-spin text-(--accent)" />
        <p className="font-medium">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto py-15 px-[5vw]">
      <Toaster position="top-left" />
      {/* HERO SECTION */}
      <div
        className="relative rounded-3xl bg-linear-to-r from-(--softAsh) to-white p-8 border 
          border-(--lightSilver) mb-10 shadow-sm"
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-md">
              <img
                src={
                  previewUrl ||
                  (user?.avatar
                    ? `${BASE_URL}${user?.avatar}`
                    : `/images/user.png`)
                }
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>

            <button
              onClick={() => {
                setIsEditing(true);
                setHasInteractedWithProfile(true);
              }}
              className="absolute -bottom-2 -right-2 bg-white p-2 rounded-lg shadow-md border 
                border-(--coolGrey) hover:text-(--accent) transition"
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
                {new Date(user?.createdAt).toLocaleDateString("en-NG", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl 
              font-semibold hover:bg-red-100 transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

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
                    className="text-(--accent) font-bold text-sm"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <form
                  onSubmit={handleUpdate}
                  className={`space-y-4 ${hasInteractedWithProfile ? "animate-zoom-in" : ""}`}
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
                        setPreviewUrl(null);
                        setSelectedFile(null);
                      }}
                      className="px-6 py-2 bg-(--softAsh) rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div
                  className={`space-y-4 ${hasInteractedWithProfile ? "animate-zoom-in" : ""}`}
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

        {activeTab === "orders" && (
          <div className="fade-up">
            {isDataLoading ? (
              <div className="flex flex-col items-center py-20 text-(--textMuted)">
                <Loader2 size={32} className="animate-spin mb-2" />
                <p className="text-sm">Fetching your history...</p>
              </div>
            ) : orders.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {orders.map((item) => (
                  <OrderCard
                    key={item._id}
                    order={item}
                    onRemove={(id) => setItemToDelete({ type: "order", id })}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Package size={48} />}
                title="No orders yet"
                desc="Items you purchase will appear here."
                btnText="Start Shopping"
                onAction={() => router.push("/shop")}
              />
            )}
          </div>
        )}

        {activeTab === "consultations" && (
          <div className="fade-up">
            {isDataLoading ? (
              <div className="flex flex-col items-center py-20 text-(--textMuted)">
                <Loader2 size={32} className="animate-spin mb-2" />
                <p className="text-sm">Fetching your history...</p>
              </div>
            ) : consultations.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {consultations.map((item) => (
                  <ConsultationCard
                    key={item._id}
                    consultation={item}
                    onClick={(id) =>
                      setItemToDelete({ type: "consultation", id })
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Calendar size={48} />}
                title="No consultations scheduled"
                desc="Book a session with our experts to see them here."
                btnText="Book a Consultation"
                onAction={() => router.push("/pages/consultation")}
              />
            )}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 mt-0.5 text-(--accent) flex items-center justify-center"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 mt-0.5 text-(--accent) flex items-center justify-center"
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
                onClick={() =>
                  setItemToDelete({ type: "account", id: user._id })
                }
                className="flex items-center gap-3 w-full p-4 text-left rounded-2xl bg-red-50 text-red-700 hover-bg-red-100 transition border border-red-100"
              >
                <ShieldAlert size={20} />

                <div>
                  <p className="font-bold">Delete Account</p>
                  <p className="text-xs opacity-80">
                    Permanently remove your data from Hair Language
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        <DeleteModal
          isOpen={itemToDelete.type !== null}
          onClose={() => setItemToDelete({ type: null, id: null })}
          onConfirm={handleConfirmDelete}
          loading={isDeleting}
          title={
            itemToDelete.type === "account"
              ? "Delete your account?"
              : itemToDelete.type === "order"
                ? "Remove order from history?"
                : "Remove consultation from history?"
          }
          description={
            itemToDelete.type === "account"
              ? "This will permanently delete all your data, orders, and consultations. This action cannot be undone"
              : itemToDelete.type === "order"
                ? "This order will be removed from your profile. This action cannot be undone."
                : "This consultation will be removed from your profile. This action cannot be undone."
          }
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

// HELPER COMPONENTS

export function DetailRow({ label, value, css }) {
  return (
    <div className="flex flex-col border-b border-(--lightSilver) pb-3 overflow-hidden">
      <span className="text-xs font-bold text-(--textMuted) uppercase tracking-tighter">
        {label}
      </span>
      <span className={`text-(--textColor) font-medium break-all ${css}`}>
        {value}
      </span>
    </div>
  );
}

export function SecurityButton({ label, desc, onClick, css }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-5 rounded-2xl border border-(--coolGrey) 
        hover:border-(--accent) hover:bg-(--softAsh) transition group ${css}`}
    >
      <p className="font-bold text-(--textColor) group-hover:text-(--accent)">
        {label}
      </p>
      <p className="text-sm text-(--textMuted)">{desc}</p>
    </button>
  );
}

function EmptyState({ icon, title, desc, btnText, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-(--softAsh) rounded-3xl border border-dashed border-(--coolGrey) text-center zoom-in-95 animate-in">
      <div className="text-(--textMuted) mb-4 opacity-40">{icon}</div>
      <h3 className="text-lg font-bold text-(--textColor)">{title}</h3>
      <p className="text-(--textMuted) max-w-62.5 mx-auto text-sm">{desc}</p>

      {btnText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 mt-4 bg-(--textColor) text-white text-xs font-bold rounded-xl hover:bg-(--accent) transition shadow-sm"
        >
          {btnText}
        </button>
      )}
    </div>
  );
}

function ConsultationCard({ consultation, onClick }) {
  const isReplied = !!consultation.adminReply;

  return (
    <div className="bg-white border border-(--coolGrey) rounded-3xl p-6 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span
            className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
              consultation.status === "pending"
                ? "bg-orange-50 text-orange-600"
                : consultation.status === "archived"
                  ? "bg-(--textMuted) text-white"
                  : "bg-green-50 text-green-600"
            }`}
          >
            {consultation.status === "archived"
              ? "Contacted"
              : consultation.status}
          </span>
          <h4 className="text-lg font-bold mt-2 text-(--textColor)">
            {consultation.message?.substring(0, 40)}...
          </h4>
          <p className="text-xs text-(--textMuted)">
            Requested on {new Date(consultation.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-1 flex-wrap justify-end max-w-50">
          {consultation.texture?.map((t) => (
            <span
              key={t}
              className="text-[9px] bg-(--softAsh) px-2 py-0.5 rounded text-(--textMuted) font-semibold whitespace-nowrap"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {isReplied ? (
        <div className="bg-(--softAsh) p-4 rounded-2xl border border-(--lightSilver)">
          <p className="text-xs font-bold text-(--accent) mb-1 italic">
            Francisca's Reply:
          </p>
          <p className="text-sm text-(--textColor)">
            {consultation.adminReply}
          </p>
        </div>
      ) : (
        <div className="border border-dashed border-(--coolGrey) p-4 rounded-2xl text-center">
          <p className="text-xs text-(--textMuted)">
            Awaiting response from our stylists...
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => onClick(consultation._id)}
          className="text-xs font-medium bg-red-50 text-red-600 mt-4 p-2 rounded-xl"
        >
          Remove from history
        </button>
      </div>
    </div>
  );
}

function OrderCard({ order, onRemove }) {
  const getColorStatus = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "shipped":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-orange-100 text-orange-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-(--softAsh) text-(--textMuted)";
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-(--coolGrey) hover:shadow-md transition space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-(--textMuted) uppercase tracking-wider">
            Order Reference
          </p>
          <p className="font-bold text-sm">
            #{order._id.slice(-8).toUpperCase()}
          </p>
        </div>
        <span
          className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full ${getColorStatus(order.status)}`}
        >
          {order.status}
        </span>
      </div>

      <div className="border-t border-b border-(--softAsh) py-3 space-y-2">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-(--textMuted)">
              {item.quantity}x {item.productName}
            </span>
            <span className="font-medium">{item.size}"</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <p className="font-black text-(--accent)">
          Total: {formatPrice(order.totalAmount)}
        </p>

        <button
          onClick={() => onRemove(order._id)}
          className="text-xs font-medium bg-red-50 text-red-500 p-2 rounded-xl"
        >
          Remove from history
        </button>
      </div>
    </div>
  );
}

/*
useEffect(() => {
    const fetchData = async function () {
      if (!isAuthenticated || !user) return;
      setIsDataLoading(true);

      try {
        const [orderRes, bookingRes] = await Promise.all([
          server.get("/api/orders/my-orders")
          server.get("/api/my-consultations"),
        ]);

        setOrders(orderRes.data.orders || [])
        setConsultations(bookingRes.data.bookings || []);
      } catch (error) {
       console.error("Fetch Error:", error)
        toast.error(
          error.response?.data?.message || "Error fetching activity data.",
        );
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user]);
*/

// const fetchData = useCallback(
//   async function () {
//     if (!isAuthenticated || !user) return;
//     setIsDataLoading(true);

//     try {
//       const response = await server.get("/api/my-consultations");
//       setConsultations(response.data.bookings || []);
//     } catch (error) {
//       console.error("Fetch error:", error);
//       // toast.error(
//       //   error.response?.data?.message || "Error fetching activity data.",
//       // );
//     } finally {
//       setIsDataLoading(false);
//     }
//   },
//   [isAuthenticated, user],
// );

// Handle Account Deletion
// const handleDelete = async function () {
//   setIsDeleting(true);

//   try {
//     const response = await server.delete("/auth/delete-account");
//     toast.success(response.data.message || "Account deleted successfully.");

//     setItemToDelete(null);

//     setTimeout(() => {
//       window.location.href = "/login";
//     }, 1500);
//   } catch (error) {
//     toast.error(error.response?.data?.message || "Failed to delete account.");
//   } finally {
//     setIsDeleting(false);
//   }
// };

// ===== Handle User Delete History =====
// ***** Consultation *****
// const handleBookingDelete = async function () {
//   // if (!confirm("Remove this activity from your profile?")) return;
//   const id = itemToDelete.id;
//   if (!id) return;

//   setIsDeleting(true);
//   try {
//     await server.patch(`/api/my-consultations/${id}/hide`);
//     toast.success("Removed from history.");

//     setConsultations((prev) => prev.filter((item) => item._id !== id));
//     setItemToDelete({ type: null, id: null });
//   } catch (error) {
//     toast.error(
//       error.response?.data?.message || "Failed to remove activity.",
//     );
//   } finally {
//     setIsDeleting(false);
//   }
// };

// ***** Orders *****
// const handleRemoveOrder = async function () {
//   const id = itemToDelete.id;
//   if (!id) return;

//   setIsDeleting(true);
//   try {
//     await server.patch(`/api/orders/${id}/hide`);
//     toast.success("Removed from history.");

//     setOrders((prev) => prev.filter((item) => item._id !== id));
//     setItemToDelete({ type: null, id: null });
//   } catch (error) {
//     toast.error(
//       error.response?.data?.message || "Failed to remove activity.",
//     );
//   } finally {
//     setIsDeleting(false);
//   }
// };
