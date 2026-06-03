"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Mail,
  Phone,
  X,
  Filter,
  Download,
  Loader2,
  Trash2,
  Archive,
} from "lucide-react";
import server from "@/app/(main)/utils/axiosClient";
import { useNotifications } from "@/providers/admin/notification-provider";
import toast, { Toaster } from "react-hot-toast";
import DeleteModal from "../components/deleteModal";
import { useAdminSearch } from "@/providers/admin/admin-search-provider";
import { exportToCSV } from "../components/csvExporter";

export default function Bookings() {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("pending");
  const [showFilters, setShowFilters] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { setCounts, lastUpdated } = useNotifications();
  const { searchQuery } = useAdminSearch();

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const fetchBookings = useCallback(async function (isSilent = false) {
    try {
      if (!isSilent) setLoading(true);
      const response = await server.get("/api/consultations");
      setBookings(response.data?.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error.message);
      setBookings([]);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // INITIAL LOAD
  useEffect(() => {
    fetchBookings(false);
  }, [fetchBookings]);

  // NOTIFICATION SYNC
  useEffect(() => {
    // Only fetch silently if we aren't already loading for the first time
    if (!loading) {
      fetchBookings(true);
    }
  }, [lastUpdated, fetchBookings]);

  // THE TOGGLE FUNCTION
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "pending" ? "contacted" : "pending";

    try {
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b)),
      );

      if (selectedBooking?._id === id) {
        setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
      }

      setCounts((prev) => ({
        ...prev,
        bookings:
          newStatus === "pending"
            ? prev.bookings + 1
            : Math.max(0, prev.bookings - 1),
      }));

      await server.patch(`/api/consultations/${id}`, { status: newStatus });

      toast.success(`Marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status. Reverting changes.");
      fetchBookings(true);
    }
  };

  // DELETE BOOKING
  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      await server.delete(`/api/consultations/${itemToDelete._id}`);
      toast.success("Booking deleted successfully");
      setSelectedBooking(null);
      fetchBookings(true);
      setItemToDelete(null);
    } catch (error) {
      toast.error("Failed to delete booking.");
      console.error(
        `Error deleting booking: ${error.response?.data?.message || error.message}`,
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // HANDLE CONTACT
  const handleContact = async (contact, name) => {
    if (!contact) return;

    if (contact.includes("@")) {
      setIsReplyModalOpen(true);
    } else {
      // Remove all non-numeric characters (spaces, +, dashes)
      let cleanNumber = contact.replace(/\D/g, "");

      // Fix leading zero for Nigeria (090... becomes 23490...)
      if (cleanNumber.startsWith("0")) {
        cleanNumber = "234" + cleanNumber.substring(1);
      }
      // If it doesn't start with 234 yet (and isn't a 0 number), add it
      else if (!cleanNumber.startsWith("234")) {
        cleanNumber = "234" + cleanNumber;
      }

      const msg = encodeURIComponent(
        `Hello ${name}, this is Franscisca from Hair Language. I'm reaching out regarding your consultation request: "${selectedBooking?.message}"`,
      );

      // Use _blank to ensure it opens a new tab/app correctly
      window.open(`https://wa.me/${cleanNumber}?text=${msg}`, "_blank");
    }
  };

  // HANDLE ADMIN EMAIL REPLY
  const sendEmailReply = async () => {
    if (!replyText.trim()) return;

    if (selectedBooking.status === "contacted") {
      toast.error("This user has already been contacted.");
      return;
    }

    try {
      setSendingEmail(true);
      const id = selectedBooking._id;

      await server.post(`/api/consultations/${id}/reply`, {
        message: replyText,
      });

      // update status
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "contacted" } : b)),
      );
      setSelectedBooking((prev) => ({ ...prev, status: "contacted" }));

      // update notification counts
      setCounts((prev) => ({
        ...prev,
        bookings: Math.max(0, prev.bookings - 1),
      }));

      toast.success("Email sent and status updated successfully");
      setIsReplyModalOpen(false);
      setReplyText("");
      setSelectedBooking(null);
      fetchBookings(false);
    } catch (error) {
      toast.error("Failed to send email. Please check your connection");
      console.error(error.message);
    } finally {
      setSendingEmail(false);
    }
  };

  // FILTER BOOKINGS
  const filteredbookings = bookings.filter((booking) => {
    const status = booking.status?.toLowerCase();

    let matchesFilter = false;
    if (activeFilter === "archived") matchesFilter = status === "archived";
    else if (activeFilter === "all") matchesFilter = status !== "archived";
    else matchesFilter = status === activeFilter;

    if (!normalizedQuery) return matchesFilter;

    const haystack = [
      booking.name,
      booking.contact,
      booking.message,
      booking.status,
      ...(booking.texture || []),
      ...(booking.occasion || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matchesFilter && haystack.includes(normalizedQuery);
  });

  // CSV EXPORT HANDLER
  const handleExportBookings = () => {
    if (!filteredbookings || filteredbookings.length === 0) {
      toast.error("No booking data available to export.");
      return;
    }

    const dataToExport = filteredbookings.map((booking) => {
      // Flatten arrays like textures and occasions into comma-separated text blocks
      const preferredTextures = Array.isArray(booking.texture)
        ? booking.texture.join(", ")
        : booking.texture || "N/A";

      const occasionsList = Array.isArray(booking.occasion)
        ? booking.occasion.join(", ")
        : booking.occasion || "N/A";

      return {
        "Booking ID": booking._id.toUpperCase(),
        "Customer Name": booking.name,
        "Contact Info (Phone/Email)": booking.contact,
        Status: booking.status.toUpperCase(),
        "Preferred Textures": preferredTextures,
        Occasion: occasionsList,
        "Customer Message": booking.message || "",
        "Submitted At": booking.createdAt
          ? new Date(booking.createdAt).toLocaleDateString("en-NG")
          : "N/A",
        "User Deleted Account": booking.deletedByUser ? "Yes" : "No",
      };
    });

    exportToCSV(dataToExport, `hair-language-bookings-${activeFilter}.csv`);
  };

  // ARCHIVE FUNCTION
  const archiveBooking = async (booking) => {
    const isArchived = booking.status === "archived";

    // If we are unarchiving, use the saved previousStatus.
    // If archiving, the current status becomes the "previousStatus"
    const newStatus = isArchived
      ? booking.previousStatus || "pending"
      : "archived";
    const updatedPreviousStatus = isArchived ? null : booking.status;

    try {
      setBookings((prev) =>
        prev.map((b) =>
          b._id === booking._id
            ? { ...b, status: newStatus, previousStatus: updatedPreviousStatus }
            : b,
        ),
      );
      setSelectedBooking(null);

      // Reduce count if we are moving a 'pending' item to archive
      if (!isArchived && booking.status === "pending") {
        setCounts((prev) => ({
          ...prev,
          bookings: Math.max(0, prev.bookings - 1),
        }));
      }
      // Increase count if we are bringing an archived item back to 'pending'
      else if (isArchived && booking.status === "pending") {
        setCounts((prev) => ({ ...prev, bookings: prev.bookings + 1 }));
      }

      await server.patch(`/api/consultations/${booking._id}`, {
        status: newStatus,
        previousStatus: updatedPreviousStatus,
      });
    } catch (error) {
      toast.error(`Failed to archive. Please try again`);
      console.error(error.message);
      fetchBookings(true);
    }
  };

  if (loading)
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-(--accent)" size={40} />
      </div>
    );

  return (
    <main className="space-y-6">
      <Toaster position="top-left" />

      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-(--textMuted) uppercase tracking-[0.2em]">
            Consultation Requests
          </h2>
          <p className="text-xs text-(--textMuted) mt-1 font-medium">
            Showing {filteredbookings.length} total{" "}
            {filteredbookings.length === 1 ? "inquiry" : "inquiries"}
            {normalizedQuery ? ` matching "${searchQuery.trim()}"` : ""}
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportBookings}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 
              text-xs bg-(--textColor) text-white rounded-xl font-semibold transition-all"
          >
            <Download size={14} /> Export
          </button>
        </div>
      </header>

      {/* LIVE UPDATE */}
      <div className="flex items-center gap-4 w-fit bg-white border border-(--lightSilver) px-3 py-1.5 rounded-full shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-(--textMuted) font-medium">
            Live Updates Active
          </span>
        </div>

        <div className="h-3 w-px bg-(--lightSilver)" />

        <span className="text-[10px] text-(--textMuted) font-medium">
          Last Synced:{" "}
          {lastUpdated.toLocaleTimeString("en-NG", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      </div>

      {/* FILTER BUTTON */}
      <div
        className={`relative overflow-hidden ${showFilters ? "space-y-4" : "space-y-0"}`}
      >
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="relative z-10 flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 
          text-xs bg-white border border-(--lightSilver) rounded-xl hover:bg-(--softAsh) font-semibold transition-all"
        >
          <Filter size={14} /> {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

        <div
          className={`w-full transform transition-all duration-300 ease-in-out ${
            showFilters
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0 absolute"
          }`}
        >
          <div className="flex gap-4 border-b border-(--lightSilver) mb-4">
            {["pending", "contacted", "all", "archived"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`pb-3 text-xs font-bold  uppercase tracking-wider transition-all ${
                  activeFilter === tab
                    ? "border-b-2 border-(--textColor) text-(--textColor)"
                    : "text-(--textMuted) hover:text-(--textColor) border-b-2 border-transparent"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LIST SECTION */}
      <div className="grid grid-cols-1 gap-4">
        {filteredbookings.length > 0 ? (
          filteredbookings.map((booking) => {
            // Less than 1 minute old
            const isVeryNew = new Date() - new Date(booking.createdAt) < 60000;

            return (
              <div
                key={booking._id}
                onClick={() => setSelectedBooking(booking)}
                className="bg-white p-5 rounded-2xl border border-(--lightSilver) active:scale-[0.98] transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-(--softAsh) flex items-center justify-center font-bold text-xs">
                      {booking.name.charAt(0)}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-(--headingPrimary)">
                        {booking.name}

                        {booking.deletedByUser && (
                          <span
                            className="bg-red-50 text-red-600 text-[8px] px-1.5 py-0.5 
                              rounded-sm border border-red-100 font-bold uppercase ml-2"
                          >
                            User Deleted
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-(--textMuted)">
                        {booking.createdAt
                          ? new Date(booking.createdAt).toLocaleDateString(
                              "en-NG",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "No Date"}

                        {isVeryNew && (
                          <span
                            className="ml-4 bg-green-100 text-green-700 text-[8px] font-bold 
                          px-1 rounded animate-bounce"
                          >
                            NEW
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase ${
                      booking.status === "pending"
                        ? "bg-orange-50 text-orange-600"
                        : booking.status === "archived"
                          ? "bg-(--textMuted) text-white"
                          : "bg-green-50 text-green-600"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <p className="text-xs text-(--textColor) bg-(--softAsh) p-3 rounded-xl">
                  "{booking.message}"
                </p>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center border border-dashed border-(--lightSilver) rounded-2xl">
            <p className="text-sm text-(--textMuted)">
              {normalizedQuery
                ? `No bookings found for "${searchQuery.trim()}".`
                : `No ${activeFilter} bookings found`}
            </p>
          </div>
        )}
      </div>

      {/* DETAILS SIDEBAR */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          selectedBooking ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* OVERLAY */}
        <div
          className={`absolute inset-0 bg-(--textColor)/40 backdrop-blur-xs transition-opacity 
            duration-300 ${selectedBooking ? "opacity-100" : "opacity-0"}`}
          onClick={() => {
            setSelectedBooking(null);
            setIsReplyModalOpen(false);
          }}
        />
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl 
            transform transition-transform duration-300 ease-in-out ${
              selectedBooking ? "translate-x-0" : "translate-x-full"
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          {selectedBooking && (
            <section className="p-8 h-full flex flex-col relative">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold">{selectedBooking.name}</h2>
                  <p className="text-xs text-(--textMuted) font-medium">
                    {selectedBooking.contact}
                  </p>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
                      selectedBooking.status === "pending"
                        ? "bg-orange-50 text-orange-600"
                        : selectedBooking.status === "archived"
                          ? "bg-(--textMuted) text-white"
                          : "bg-green-50 text-green-600"
                    }`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-2 hover:bg-(--softAsh) rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto scrollbar-hide">
                {/* QUICK ACTIONS */}
                <div className="space-y-2">
                  <button
                    onClick={() =>
                      handleContact(
                        selectedBooking.contact,
                        selectedBooking.name,
                      )
                    }
                    disabled={sendingEmail}
                    className="flex items-center justify-center gap-2 w-full bg-(--textColor) text-white p-3.5 rounded-xl text-sm font-semibold hover:bg-(--textColor)/90 transition-all"
                  >
                    {selectedBooking.contact.includes("@") ? (
                      <Mail size={16} />
                    ) : (
                      <Phone size={16} />
                    )}
                    {selectedBooking.contact.includes("@")
                      ? "Reply via Email"
                      : "Chat on WhatsApp"}
                  </button>

                  <button
                    disabled={selectedBooking.status === "archived"}
                    onClick={() =>
                      toggleStatus(selectedBooking._id, selectedBooking.status)
                    }
                    className={`flex items-center justify-center gap-2 w-full p-3 rounded-xl text-sm font-semibold border transition-all ${
                      selectedBooking.status === "archived"
                        ? "opacity-50 cursor-not-allowed border-gray-200 text-gray-400 bg-gray-50"
                        : selectedBooking.status === "pending"
                          ? "border-(--accent) text-(--textColor) hover:bg-(--softAsh)"
                          : "border-green-600 text-green-600 bg-green-50"
                    }`}
                  >
                    <CheckCircle2 size={16} />
                    {selectedBooking.status === "archived"
                      ? "Archived (Restore to edit)"
                      : selectedBooking.status === "pending"
                        ? "Mark Contacted"
                        : "Completed"}
                  </button>
                </div>

                {/* ADMIN REPLY MODAL */}
                <div
                  className={`absolute inset-0 w-full h-full bg-white py-6 px-10 transform 
                    transition-transform duration-300 ease-in-out overflow-hidden space-y-10 ${
                      isReplyModalOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-2xl text(--headingPrimary)">
                      Admin Reply
                    </h2>

                    <button
                      onClick={() =>
                        !sendingEmail && setIsReplyModalOpen(false)
                      }
                      className="w-10 h-10 bg-transparent hover:bg-(--softAsh) rounded-full flex items-center 
                      justify-center group transition-all"
                    >
                      <X size={22} className="group-hover:scale-110" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold">
                      Reply to {selectedBooking?.name}
                    </h3>
                  </div>

                  <div className=" space-y-4">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-(--textMuted) mb-2 block">
                      Your Message
                    </label>

                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Input your response..."
                      className="w-full h-48 p-4 bg-(--softAsh) rounded-2xl text-sm focus:outline-none 
                      resize-none focus:ring-2 focus:ring-(--lightSilver)"
                    />

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setIsReplyModalOpen(false);
                          setReplyText("");
                        }}
                        className="flex-1 p-3.5 text-sm font-semibold border border-(--accent) rounded-xl hover:bg-(--softAsh) transition-all"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={sendEmailReply}
                        disabled={sendingEmail || !replyText.trim()}
                        className={`flex-2 p-3.5 text-sm font-semibold bg-(--textColor) text-white rounded-xl transition-all ${
                          sendingEmail || !replyText.trim()
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-(--textColor)/90 active:scale-95"
                        }`}
                      >
                        {sendingEmail ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 size={18} className="animate-spin" />{" "}
                            Sending...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Mail size={18} /> Send Reply
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* DETAILS SECTION */}
                <section className="space-y-6">
                  <div className="p-5 bg-(--softAsh) rounded-2xl">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-(--textMuted) mb-2">
                      Customer Message
                    </h4>
                    <p className="text-sm leading-relaxed">
                      "{selectedBooking.message}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-(--textMuted) font-bold mb-3">
                        Preferred Textures
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedBooking.texture.map((t) => (
                          <span
                            key={t}
                            className="px-3 py-1 border border-(--lightSilver) text-[11px] font-medium rounded-lg"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-(--textMuted) font-bold mb-2">
                        Occasion
                      </h4>
                      <p className="text-xs font-medium">
                        {selectedBooking.occasion.join(", ")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-(--textMuted) font-bold mb-2">
                      Contact Info
                    </h4>
                    <div className="flex items-center justify-between p-3 bg-(--softAsh) rounded-xl">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Phone size={14} className="text-(--textMuted)" />
                        {selectedBooking.contact}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            selectedBooking.contact,
                          );
                          alert("Copied to clipboard!");
                        }}
                        className="text-[10px] bg-white border border-(--lightSilver) px-2 py-1 
                        rounded-md hover:bg-(--textColor) hover:text-white transition-all font-bold"
                      >
                        COPY
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <button
                        onClick={() => archiveBooking(selectedBooking)}
                        className={`w-full flex items-center justify-center gap-2 p-3 border 
                           text-sm font-semibold rounded-xl transition-colors ${
                             selectedBooking.status === "archived"
                               ? "border-(--textMuted) text-(--textMuted) hover:bg-(--softAsh)"
                               : "border-(--textColor) text-(--textColor) hover:bg-(--softAsh)"
                           }`}
                      >
                        <Archive size={16} />{" "}
                        {selectedBooking.status === "archived"
                          ? "Unarchive booking"
                          : "Archive Booking"}
                      </button>
                    </div>

                    <div>
                      <button
                        onClick={() => setItemToDelete(selectedBooking)}
                        disabled={selectedBooking.status === "pending"}
                        className={`w-full p-3 flex items-center justify-center gap-2 text-sm 
                          font-semibold rounded-xl transition-colors ${
                            selectedBooking.status === "pending"
                              ? "bg-(--softAsh) text-(--textColor) cursor-not-allowed"
                              : "bg-red-500 text-white hover:bg-red-600"
                          }`}
                      >
                        <Trash2 size={16} />{" "}
                        {selectedBooking.status === "pending"
                          ? "Resolve to Delete"
                          : "Delete Booking"}
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* DELETE MODAL */}
      <DeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Booking"
        description={`Are you sure you want to delete booking?`}
      />
    </main>
  );
}
