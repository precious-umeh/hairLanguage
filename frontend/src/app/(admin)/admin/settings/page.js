"use client";

import {
  Bell,
  Globe,
  Info,
  Link2,
  Loader2,
  Clock,
  Mail,
  MapPin,
  Phone,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";
import initialSocialLinks from "../data-sources/socialLinks";
import server, { BASE_URL } from "@/app/(main)/utils/axiosClient";
import DeleteModal from "../components/deleteModal";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/providers/admin/auth-provider";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const { currentSessionId, user, setAuthData } = useAuth();

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twofactorData, setTwofactorData] = useState(null); // Stores qrCode
  const [otpCode, setOtpCode] = useState("");
  const [verifying2FA, setVerifying2FA] = useState(false);

  const router = useRouter();

  const [preferences, setPreferences] = useState({
    newOrderAlerts: true,
    lowStockWarning: true,
    outOfStock: false,
    newCustomerSignup: false,
    payoutConfirmations: true,
  });

  const [formData, setFormData] = useState({
    storeName: "Hair Language",
    storeDescription: "",
    supportEmail: "info@hairlanguage.com",
    businessPhone: "+234 800 000 0000",
    openingHours: "",
    storeAddress: "",
    maintenanceMode: false,
  });

  const [socialLinks, setSocialLinks] = useState(initialSocialLinks);
  const [activeTab, setActiveTab] = useState("general");

  const navTabs = [
    {
      id: "general",
      label: "General",
      icon: <Settings size={18} />,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell size={18} />,
    },
    {
      id: "security",
      label: "Security",
      icon: <ShieldCheck size={18} />,
    },
  ];

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);

      try {
        const [generalRes, notificationRes] = await Promise.all([
          server.get("/api/admin/settings/general/public"),
          server.get("/api/admin/settings/notifications/get"),
        ]);

        // Process General Config Setup
        const generalPayload = generalRes.data?.data ?? generalRes.data;

        if (generalPayload) {
          setFormData({
            storeName: generalPayload.storeName || "Hair Language",
            storeDescription: generalPayload.storeDescription || "",
            supportEmail:
              generalPayload.supportEmail || "info@hairlanguage.com",
            businessPhone:
              generalPayload.businessPhone || "+234 800 000 0000",
            openingHours: generalPayload.openingHours || "",
            storeAddress: generalPayload.storeAddress || "", // Correctly binds state values on refresh
            maintenanceMode: generalPayload.maintenanceMode || false,
          });

          if (generalPayload.socials) {
            setSocialLinks((prev) =>
              prev.map((item) => ({
                ...item,
                defaultValue:
                  generalPayload.socials[item.id] !== undefined
                    ? generalPayload.socials[item.id]
                    : item.defaultValue,
              })),
            );
          }
        }

        // Process Notifications Settings Registry
        if (notificationRes.data?.success) {
          setPreferences(notificationRes.data.data);
        }
      } catch (error) {
        console.error(
          "Error loading system configurations concurrently:",
          error,
        );
        toast.error("Failed to load initial configurations accurately.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Handle Fetch Sessions
  const fetchSessions = async function () {
    setLoadingSessions(true);

    try {
      const response = await server.get("/auth/get-sessions");

      if (response.data.success) {
        setSessions(response.data.sessions);
      }
    } catch (error) {
      toast.error("Could not load active sessions.");
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (activeTab === "security") {
      fetchSessions();
    }
  }, [activeTab]);

  // Handle social input change
  const handleSocialInputChange = (id, value) => {
    setSocialLinks((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, defaultValue: value } : item,
      ),
    );
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Submit Handler
  const handleSaveSettings = async () => {
    try {
      const socialsPayload = socialLinks.reduce((acc, current) => {
        acc[current.id] = current.defaultValue;
        return acc;
      }, {});

      const combinedPayload = {
        ...formData,
        socials: socialsPayload,
      };

      const token = localStorage.getItem("token");
      await server.patch(
        "/api/admin/settings/general/update",
        combinedPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success("All configurations saved successfully!");
    } catch (error) {
      console.error("Failed to update general settings:", error);
      toast.error("Error saving settings");
    }
  };

  // Update specific toggles dynamically
  const handleToggleChange = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Push updated settings back to database
  const savePreferences = async () => {
    setUpdating(true);

    try {
      const res = await server.patch(
        "/api/admin/settings/notifications/update",
        preferences,
      );

      if (res.data.success) {
        toast.success("Preferences saved successfully.");
      }
    } catch (error) {
      toast.error("Failed to update notifications control.");
    } finally {
      setUpdating(false);
    }
  };

  // Handle Session Signout
  const handleSignOut = async function (sessionId) {
    try {
      const response = await server.delete(`/auth/delete-session/${sessionId}`);

      if (response.data.success) {
        setSessions((prev) => prev.filter((s) => s._id !== sessionId));
        toast.success("Signed out of session successfully.");
      }
    } catch (error) {
      toast.error("Failed to sign out session");
    }
  };

  // Handle Initiate 2FA
  const handleInitiate2FA = async function () {
    try {
      const response = await server.get("/auth/2fa/setup");
      setTwofactorData(response.data);
      setShow2FAModal(true);
    } catch (error) {
      toast.error("Failed to initialize 2FA setup.");
    }
  };

  // Handle 2FA Verification
  const handleVerifyAndEnable2FA = async function () {
    setVerifying2FA(true);

    try {
      await server.post("/auth/2fa/verify", {
        code: otpCode,
      });

      const updatedUser = {
        ...user,
        twofactor: { enabled: true },
      };
      setAuthData(updatedUser, localStorage.getItem("token"));

      toast.success("Two-Factor Authentication enabled!");
      setShow2FAModal(false);
      setTwofactorData(null);
      setOtpCode("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Invalid verification code.",
      );
    } finally {
      setVerifying2FA(false);
    }
  };

  // Handle Disable 2FA
  const handleDisable2FA = async function () {
    if (
      !window.confirm(
        "Are you sure you want to disable 2FA. This will decrease your account's security.",
      )
    )
      return;

    try {
      await server.post("/auth/2fa/disable");

      const updatedUser = {
        ...user,
        twofactor: { enabled: false, secret: null },
      };
      setAuthData(updatedUser, localStorage.getItem("token"));

      toast.success("2FA disabled successfully.");
    } catch (error) {
      toast.error("Failed to disable 2FA");
    }
  };

  // Handle Account Deletion
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
      console.error("Logout error:", error);
      toast.error(error.response?.data?.message || "Failed to delete account.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-75">
        <Loader2 className="animate-spin text-(--textMuted)" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <Toaster position="top-left" />
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-(--textMuted) uppercase tracking-[0.2em]">
            Platform Settings
          </h2>
          <p className="text-xs text-(--textMuted) mt-1 font-medium">
            Configure your store and administrative preferences
          </p>
        </div>
      </header>

      <div className="flex gap-4 border-b border-(--coolGrey) mb-8 overflow-x-auto scrollbar-hide">
        {navTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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

      {/* Content Area */}
      <div className="min-h-75">
        {/* *
         * ========= GENERAL TAB ==========
         * */}
        {activeTab === "general" && (
          <div className="fade-up space-y-6 text-(--textColor)">
            {/* Store Identity Section */}
            <section className="bg-white p-5 md:p-8 rounded-3xl border border-(--coolGrey) max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-(--softAsh) rounded-xl shrink-0">
                  <Store className="text-(--accent)" size={20} />
                </div>
                <h3 className="text-lg md:text-xl font-bold">
                  Store Configuration
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] md:text-xs font-bold text-(--textMuted) uppercase tracking-wider px-1">
                    Store Name
                  </label>
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleInputChange}
                    className="w-full p-3.5 border border-(--coolGrey) rounded-2xl outline-(--accent) text-sm font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] md:text-xs font-bold text-(--textMuted) uppercase tracking-wider px-1">
                    Store URL
                  </label>
                  <div className="flex items-center gap-2 p-3.5 border border-(--coolGrey) rounded-2xl bg-(--softAsh)">
                    <Globe size={16} className="text-(--textMuted)" />
                    <span className="text-sm font-semibold truncate">
                      hairlanguage.com
                    </span>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] md:text-xs font-bold text-(--textMuted) uppercase tracking-wider px-1">
                    Store Description (SEO)
                  </label>
                  <textarea
                    rows={3}
                    name="storeDescription"
                    value={formData.storeDescription}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-(--coolGrey) rounded-2xl outline-(--accent) resize-none text-sm leading-relaxed"
                    placeholder="Briefly describe your brand..."
                  />
                </div>
              </div>
            </section>

            {/* Support & Contact Section */}
            <section className="bg-white p-5 md:p-8 rounded-3xl border border-(--coolGrey) max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-(--softAsh) rounded-xl shrink-0">
                  <Info className="text-(--accent)" size={20} />
                </div>
                <h3 className="text-lg md:text-xl font-bold">
                  Public Contact Details
                </h3>
              </div>

              <div className="space-y-4">
                {/* Responsive flex behavior: stack on mobile, row on md */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-(--softAsh) rounded-2xl border border-(--coolGrey)">
                  <div className="flex items-center gap-4 flex-1">
                    <Mail className="text-(--accent) shrink-0" size={18} />
                    <div className="flex-1">
                      <p className="text-sm font-bold">Support Email</p>
                      <p className="text-[11px] text-(--textMuted)">
                        Customers will use this to contact you.
                      </p>
                    </div>
                  </div>
                  <input
                    type="email"
                    name="supportEmail"
                    value={formData.supportEmail}
                    onChange={handleInputChange}
                    className="bg-white md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none border md:border-b md:border-t-0 md:border-x-0 border-(--coolGrey) md:border-transparent focus:border-(--accent) outline-none text-sm font-semibold md:text-right"
                  />
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-(--softAsh) rounded-2xl border border-(--coolGrey)">
                  <div className="flex items-center gap-4 flex-1">
                    <Phone className="text-(--accent) shrink-0" size={18} />
                    <div className="flex-1">
                      <p className="text-sm font-bold">Business Phone</p>
                      <p className="text-[11px] text-(--textMuted)">
                        Visible on invoices and contact page.
                      </p>
                    </div>
                  </div>
                  <input
                    type="text"
                    name="businessPhone"
                    value={formData.businessPhone}
                    onChange={handleInputChange}
                    className="bg-white md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none border md:border-b md:border-t-0 md:border-x-0 border-(--coolGrey) md:border-transparent focus:border-(--accent) outline-none text-sm font-semibold md:text-right"
                  />
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-(--softAsh) rounded-2xl border border-(--coolGrey)">
                  <div className="flex items-center gap-4 flex-1">
                    <Clock className="text-(--accent) shrink-0" size={18} />
                    <div className="flex-1">
                      <p className="text-sm font-bold">Opening Hours</p>
                      <p className="text-[11px] text-(--textMuted)">
                        Shown on the contact page and footer.
                      </p>
                    </div>
                  </div>
                  <input
                    type="text"
                    name="openingHours"
                    value={formData.openingHours}
                    onChange={handleInputChange}
                    placeholder="e.g. Mon - Sat: 9am - 7pm"
                    className="bg-white md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none border md:border-b md:border-t-0 md:border-x-0 border-(--coolGrey) md:border-transparent focus:border-(--accent) outline-none text-sm font-semibold md:text-right"
                  />
                </div>

                <div className="border-t border-(--coolGrey) my-6 md:my-8" />

                <div className="flex flex-col gap-3 p-4 bg-(--softAsh) rounded-2xl border border-(--coolGrey)">
                  <div className="flex items-center gap-4">
                    <MapPin size={18} className="text-(--accent) shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-bold">Store Address</p>
                      <p className="text-[11px] text-(--textMuted)">
                        Customers will use this to locate you.
                      </p>
                    </div>
                  </div>
                  <textarea
                    name="storeAddress"
                    value={formData.storeAddress}
                    onChange={handleInputChange}
                    // defaultValue="Shop A22, Rossy Mall, Lekky County Homes, Ikota Lekki, Lagos"
                    className="w-full bg-white md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none border md:border-b md:border-t-0 md:border-x-0 border-(--coolGrey) md:border-transparent focus:border-(--accent) outline-none text-sm font-semibold resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </section>

            {/* Social Media Links Section */}
            <section className="bg-white p-5 md:p-8 rounded-3xl border border-(--coolGrey) max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-(--softAsh) rounded-xl shrink-0">
                  <Link2 className="text-(--accent)" size={20} />
                </div>
                <h3 className="text-lg md:text-xl font-bold">
                  Social Media Profiles
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {socialLinks.map((platform) => (
                  <div
                    key={platform.id}
                    className="flex items-center gap-3 md:gap-4 p-3 md:p-2 md:pl-4 bg-white border border-(--lightSilver) rounded-2xl focus-within:border-(--accent) transition-all shadow-sm md:shadow-none"
                  >
                    <div className="shrink-0">
                      <img
                        src={`${BASE_URL}${platform.icon}`}
                        className="w-5 h-5 md:w-6 md:h-6 object-contain"
                        alt={`${platform.label} Icon`}
                      />
                    </div>
                    <div className="w-px h-6 bg-(--lightSilver) hidden md:block" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] md:text-[10px] font-bold text-(--textMuted) uppercase tracking-wider">
                        {platform.label}
                      </p>
                      <input
                        type="text"
                        value={platform.defaultValue || ""}
                        onChange={(e) =>
                          handleSocialInputChange(platform.id, e.target.value)
                        }
                        className="w-full bg-transparent outline-none text-sm font-semibold text-(--textColor) truncate"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-[11px] text-(--textMuted) flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-(--accent) shrink-0 mt-1" />
                These links will appear in your website footer and "About Us"
                sections.
              </p>
            </section>

            {/* Maintenance Mode Toggle */}
            <section className="bg-white p-5 md:p-8 rounded-3xl border border-(--coolGrey) max-w-3xl">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-md md:text-lg font-bold">
                    Maintenance Mode
                  </h3>
                  <p className="text-[11px] md:text-sm text-(--textMuted) leading-tight">
                    Disables the storefront for customers while you make
                    changes.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={formData.maintenanceMode}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div
                    className="w-12 h-6 md:w-14 md:h-7 bg-(--coolGrey) peer-focus:outline-none rounded-full peer 
              peer-checked:after:translate-x-full peer-checked:after:border-white 
              after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white 
              after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 md:after:h-6 md:after:w-6 
              after:transition-all peer-checked:bg-(--accent)"
                  ></div>
                </label>
              </div>
            </section>

            {/* Global Save Button */}
            <div className="flex justify-end max-w-3xl pt-4">
              <button
                onClick={handleSaveSettings}
                className="w-full md:w-auto px-10 py-4 md:py-3 bg-(--accent) text-white rounded-2xl font-bold shadow-md hover:opacity-90 transition active:scale-95"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* *
         * ========= NOTIFICATIONS TAB ==========
         * */}
        {activeTab === "notifications" && (
          <div className="fade-up space-y-6">
            <section className="bg-white p-5 md:p-8 rounded-3xl border border-(--coolGrey) max-w-3xl mx-auto md:mx-0">
              {/* Header  */}
              <div className="flex flex-col sm:flex-row items-start gap-3 mb-8">
                <div className="p-2.5 bg-(--softAsh) rounded-xl shrink-0">
                  <Bell className="text-(--accent)" size={20} />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold">
                    Admin Notifications
                  </h3>
                  <p className="text-[11px] md:text-xs text-(--textMuted) font-medium leading-relaxed">
                    Choose how you want to be alerted about store activity.
                  </p>
                </div>
              </div>

              <div className="space-y-6 md:space-y-8">
                {/* Sales & Orders */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-(--textMuted) uppercase tracking-widest px-1">
                    Orders & Sales
                  </h4>
                  <div className="space-y-3">
                    <NotificationToggle
                      title="New Order Alerts"
                      description="Get notified immediately when a customer places an order."
                      checked={preferences.newOrderAlerts}
                      onChange={(val) =>
                        handleToggleChange("newOrderAlerts", val)
                      }
                    />
                    {/* <NotificationToggle
                      title="Order Cancellations"
                      description="Receive alerts if a customer requests a cancellation."
                      defaultChecked={true}
                    /> */}
                  </div>
                </div>

                <div className="h-px bg-(--lightSilver) mx-1" />

                {/* Inventory & Products */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-(--textMuted) uppercase tracking-widest px-1">
                    Inventory
                  </h4>
                  <div className="space-y-3">
                    <NotificationToggle
                      title="Low Stock Warning"
                      description="Alert me when a product variant drops below 5 units."
                      checked={preferences.lowStockWarning}
                      onChange={(val) =>
                        handleToggleChange("lowStockWarning", val)
                      }
                    />
                    <NotificationToggle
                      title="Out of Stock"
                      description="Notify me when a product is completely sold out."
                      checked={preferences.outOfStock}
                      onChange={(val) => handleToggleChange("outOfStock", val)}
                    />
                  </div>
                </div>

                <div className="h-px bg-(--lightSilver) mx-1" />

                {/* Customer & System */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-(--textMuted) uppercase tracking-widest px-1">
                    System & Security
                  </h4>
                  <div className="space-y-3">
                    <NotificationToggle
                      title="New Customer Signup"
                      description="Receive an alert when someone creates a new account."
                      checked={preferences.newCustomerSignup}
                      onChange={(val) =>
                        handleToggleChange("newCustomerSignup", val)
                      }
                    />
                    <NotificationToggle
                      title="Payout Confirmations"
                      description="Get notified when a payment is successfully processed to your bank."
                      checked={preferences.payoutConfirmations}
                      onChange={(val) =>
                        handleToggleChange("payoutConfirmations", val)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Button - Full width on mobile, auto width on desktop */}
              <div className="flex justify-end pt-8">
                <button
                  onClick={savePreferences}
                  disabled={updating}
                  className="w-full md:w-auto px-8 py-4 md:py-3 bg-(--accent) text-white rounded-2xl font-bold shadow-md hover:opacity-90 transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating && <Loader2 className="animate-spin" size={16} />}
                  {updating ? "Saving..." : "Update Preferences"}
                </button>
              </div>
            </section>
          </div>
        )}

        {/* *
         * ========= SECURITY TAB ==========
         * */}
        {activeTab === "security" && (
          <div className="fade-up space-y-6">
            {/* Authentication Layer */}
            <section className="bg-white p-5 md:p-8 rounded-3xl border border-(--coolGrey) max-w-3xl">
              <div className="flex flex-col sm:flex-row items-start gap-3 mb-8">
                <div className="p-2.5 bg-(--softAsh) rounded-xl shrink-0">
                  <ShieldCheck className="text-(--accent)" size={20} />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold">
                    Account Security
                  </h3>
                  <p className="text-[11px] md:text-xs text-(--textMuted) font-medium leading-relaxed">
                    Manage how you authenticate and protect your administrative
                    access.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start justify-between p-4 bg-(--softAsh) rounded-2xl border border-(--coolGrey)">
                  <div className="space-y-1">
                    <p className="text-sm font-bold">
                      Two-Factor Authentication (2FA)
                      {user?.twofactor?.enabled && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 ml-2 rounded-full">
                          Active
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-(--textMuted) max-w-md">
                      {user?.twofactor?.enabled
                        ? "Your account is secured with Google Authenticator"
                        : "Add an extra layer of security by requiring a verification code from your Google Authenticator app."}
                    </p>
                  </div>

                  {user?.twofactor?.enabled ? (
                    <button
                      onClick={handleDisable2FA}
                      className="w-full md:w-auto px-4 py-2.5 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-all active:scale-95"
                    >
                      Disable 2FA
                    </button>
                  ) : (
                    <button
                      onClick={handleInitiate2FA}
                      className="w-full md:w-auto px-4 py-2.5 bg-white border border-(--coolGrey) text-(--accent) text-xs font-bold rounded-xl hover:bg-(--accent) hover:text-white transition-all active:scale-95"
                    >
                      Enable
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2 md:gap-0 md:flex-row items-start md:items-center justify-between px-2">
                  <div>
                    <p className="text-sm font-bold">Password Last Changed</p>
                    <p className="text-xs text-(--textMuted)">
                      Update your password every 6 months.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-(--textColor) bg-(--softAsh) md:bg-transparent px-2 py-1 md:p-0 rounded-lg">
                      {user?.passwordLastChanged
                        ? new Date(
                            user.passwordLastChanged,
                          ).toLocaleDateString()
                        : "Never"}
                    </span>

                    <button
                      onClick={() => router.push("/admin/profile?tab=security")}
                      className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-(--accent) bg-white border border-(--coolGrey) rounded-lg hover:bg-(--accent) hover:text-white transition-all active:scale-95"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Active Sessions Card */}
            <section className="bg-white p-5 md:p-8 rounded-3xl border border-(--coolGrey) max-w-3xl">
              <div className="flex flex-col sm:flex-row items-start gap-3 mb-6">
                <div className="p-2.5 bg-(--softAsh) rounded-xl shrink-0">
                  <Globe className="text-(--accent)" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Active Sessions</h3>
                  <p className="text-[11px] md:text-xs text-(--textMuted) font-medium">
                    Devices currently logged into your admin account.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {loadingSessions ? (
                  <div className="py-4 space-y-3">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-16 w-full bg-(--softAsh) animate-pulse rounded-2xl"
                      />
                    ))}
                  </div>
                ) : (
                  sessions.map((session) => {
                    const isCurrent = session._id === currentSessionId;
                    return (
                      <div
                        key={session._id}
                        className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl bg-(--softAsh) border border-(--coolGrey)"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={`p-3 rounded-xl shrink-0 ${isCurrent ? "bg-green-100 text-green-600" : "bg-white text-(--textMuted)"}`}
                          >
                            <Globe size={18} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-(--textColor) truncate">
                                {session.device.split(") ")[0].split(" (")[0] ||
                                  "Unknown Device"}
                              </p>
                              {isCurrent && (
                                <span className="px-2 py-0.5 bg-green-600 text-white text-[8px] font-black rounded-full uppercase tracking-tighter">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-(--textMuted) mt-0.5">
                              {session.location} •{" "}
                              <span className="font-mono">{session.ip}</span>
                            </p>
                          </div>
                        </div>

                        {!isCurrent ? (
                          <button
                            onClick={() => handleSignOut(session._id)}
                            className="w-full md:w-auto text-center py-2 md:py-0 text-xs font-bold text-red-500 hover:text-red-700 transition-colors md:px-4 border-t border-(--lightSilver) md:border-none mt-2 md:mt-0"
                          >
                            Sign Out
                          </button>
                        ) : (
                          <div className="hidden md:block px-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Danger Zone */}
            <section className="bg-red-50/50 p-5 md:p-8 rounded-3xl border border-red-100 max-w-3xl">
              <div className="flex items-center gap-3 mb-4 text-red-700">
                <ShieldAlert size={20} />
                <h3 className="text-lg font-bold">Danger Zone</h3>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-red-900">
                    Deactivate Admin Account
                  </p>
                  <p className="text-xs text-red-700/80 leading-relaxed">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                </div>
                <button
                  onClick={() => setItemToDelete("account")}
                  className="w-full md:w-auto px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition shadow-sm active:scale-95"
                >
                  Delete Account
                </button>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-(--textColor)/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6 animate-zoom-in">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">Secure Your Account</h3>
              <p className="text-xs text-(--textMuted)">
                Scan this QR code with Google Authenticator or any TOTP app.
              </p>
            </div>

            {twofactorData?.qrCode && (
              <div className="flex justify-center p-4 bg-(--softAsh) rounded-2xl border border-(--coolGrey)">
                <img
                  src={twofactorData.qrCode}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-(--textMuted) uppercase tracking-widest px-1">
                  Verifcation Code
                </label>
                <input
                  type="text"
                  placeholder="000 000"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full p-4 text-center text-2xl font-black tracking-[0.5em] border border-(--coolGrey) rounded-2xl outline-(--accent)"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShow2FAModal(false);
                    setOtpCode("");
                  }}
                  className="flex-1 py-4 text-sm font-bold text-(--textMuted) hover:text-(--textColor) transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleVerifyAndEnable2FA}
                  disabled={otpCode.length !== 6 || verifying2FA}
                  className="flex-2 py-4 bg-(--accent) text-white rounded-2xl font-bold shadow-md disabled:opacity-50 active:scale-95 transition-all"
                >
                  {verifying2FA ? "Verifying..." : "Verify & Enable"}
                </button>
              </div>
            </div>
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
  );
}

function NotificationToggle({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-6 group">
      <div className="flex-1">
        <p className="text-sm font-bold text-(--textColor) group-hover:text-(--accent) transition-colors">
          {title}
        </p>
        <p className="text-xs text-(--textMuted)">{description}</p>
      </div>

      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className="w-11 h-6 bg-(--coolGrey) peer-focus:outline-none rounded-full peer 
          peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] 
          after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-(--coolGrey) 
          after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
          peer-checked:bg-(--accent)"
        ></div>
      </label>
    </div>
  );
}
