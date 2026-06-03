"use client";
import { useEffect, useState, useCallback } from "react";
import { useNotifications } from "@/providers/admin/notification-provider";
import {
  Archive,
  CheckCircle2,
  Download,
  Filter,
  Loader2,
  Mail,
  Trash2,
  X,
} from "lucide-react";
import server from "@/app/(main)/utils/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import DeleteModal from "../components/deleteModal";
import { useAdminSearch } from "@/providers/admin/admin-search-provider";
import { exportToCSV } from "../components/csvExporter";

export default function Messages() {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [activeFilter, setActiveFilter] = useState("pending");
  const [showFilters, setShowFilters] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { setCounts, lastUpdated } = useNotifications();
  const { searchQuery } = useAdminSearch();

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // FETCH MESSAGES
  const fetchMessages = useCallback(async function (isSilent = false) {
    try {
      if (!isSilent) setLoading(true);
      const response = await server.get("/api/contact");
      setMessages(response.data?.data || []);
    } catch (error) {
      console.error(`Error fetching messages:`, error.message);
      setMessages([]);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // INITIAL LOAD
  useEffect(() => {
    fetchMessages(false);
  }, [fetchMessages]);

  // NOTIFICATION SYNC
  useEffect(() => {
    if (!loading) {
      fetchMessages(true);
    }
  }, [lastUpdated, fetchMessages]);

  // TOGGLE STATUS FUNCTION
  const toggleStatus = async function (id, currentStatus) {
    const newStatus = currentStatus === "pending" ? "contacted" : "pending";

    try {
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: newStatus } : m)),
      );

      if (selectedMessage?._id === id) {
        setSelectedMessage((prev) => ({ ...prev, status: newStatus }));
      }

      setCounts((prev) => ({
        ...prev,
        messages:
          newStatus === "pending"
            ? prev.messages + 1
            : Math.max(0, prev.messages - 1),
      }));

      await server.patch(`/api/contact/${id}`, { status: newStatus });

      toast.success(`Marked as ${newStatus}`);
    } catch (error) {
      toast.error(`Failed to update status. Reverting changes.`);
      fetchMessages(true);
    }
  };

  // DELETE MESSAGE
  const handleDelete = async function (currentStatus) {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      await server.delete(`/api/contact/${itemToDelete._id}`);
      toast.success("Message deleted successfully.");
      setSelectedMessage(null);
      fetchMessages(true);
      setItemToDelete(null);
    } catch (error) {
      toast.error("Failed to delete message.");
      console.error(
        `Error deleting message: ${error.response?.data?.message || error.message}`,
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // HANDLE ADMIN EMAIL REPLY
  const sendEmailReply = async () => {
    if (!replyText.trim()) return;

    if (selectedMessage.status === "contacted") {
      toast.error(`This user has already been contacted.`);
      return;
    }

    try {
      setSendingEmail(true);
      const id = selectedMessage._id;

      await server.post(`/api/contact/${id}/reply`, {
        response: replyText,
      });

      // Update status
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: "contacted" } : m)),
      );
      setSelectedMessage((prev) => ({ ...prev, status: "contacted" }));

      // Update Notification Counts
      setCounts((prev) => ({
        ...prev,
        messages: Math.max(0, prev.messages - 1),
      }));

      toast.success("Email sent and status updated successfully");
      setIsReplyModalOpen(false);
      setReplyText("");
      setSelectedMessage(null);
      fetchMessages(false);
    } catch (error) {
      toast.error("Failed to send email. Please check your connection");
      console.error(error.message);
    } finally {
      setSendingEmail(false);
    }
  };

  // FILTER MESSAGES
  const filteredMessages = messages.filter((msg) => {
    const status = msg.status?.toLowerCase();

    let matchesFilter = false;
    if (activeFilter === "all") matchesFilter = status !== "archived";
    else if (activeFilter === "archived") matchesFilter = status === "archived";
    else matchesFilter = status === activeFilter;

    if (!normalizedQuery) return matchesFilter;

    const haystack = [msg.name, msg.email, msg.subject, msg.message, msg.status]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matchesFilter && haystack.includes(normalizedQuery);
  });

  // CSV EXPORT HANDLER
  const handleExportMessages = () => {
    if (!filteredMessages || filteredMessages.length === 0) {
      toast.error("No message data available to export.");
      return;
    }

    const dataToExport = filteredMessages.map((msg) => {
      return {
        "Message ID": msg._id.toUpperCase(),
        "Sender Name": msg.name,
        "Sender Email": msg.email,
        "Subject Line": msg.subject || "No Subject",
        "Message Content": msg.message || "",
        Status: msg.status.toUpperCase(),
        "Received At": msg.createdAt
          ? new Date(msg.createdAt).toLocaleString("en-NG")
          : "N/A",
      };
    });

    exportToCSV(dataToExport, `hair-language-messages-${activeFilter}.csv`);
  };

  // ARCHIVE FUNCTION
  const archiveMessage = async (msg) => {
    const isArchived = msg.status === "archived";

    const newStatus = isArchived ? msg.previousStatus || "pending" : "archived";
    const updatedPreviousStatus = isArchived ? null : msg.status;

    try {
      setMessages((prev) =>
        prev.map((b) =>
          b._id === msg._id
            ? { ...b, status: newStatus, previousStatus: updatedPreviousStatus }
            : b,
        ),
      );
      setSelectedMessage(null);

      // Reduce count if we are moving a 'pending' item to archive
      if (!isArchived && msg.status === "pending") {
        setCounts((prev) => ({
          ...prev,
          messages: Math.max(0, prev.messages - 1),
        }));
      }
      // Increase count if we are bringing an archived item back to 'pending'
      else if (isArchived && msg.status === "pending") {
        setCounts((prev) => ({ ...prev, messages: prev.messages + 1 }));
      }

      await server.patch(`/api/contact/${msg._id}`, {
        status: newStatus,
        previousStatus: updatedPreviousStatus,
      });
    } catch (error) {
      alert(`Failed to archive. Please try again`);
      console.error(error.message);
      fetchMessages(true);
    }
  };

  // LOADING STATE
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
            Contact Messages
          </h2>
          <p className="text-xs text-(--textMuted) mt-1 font-medium">
            Showing {filteredMessages.length} total{" "}
            {filteredMessages.length <= 1 ? "message" : "messages"}
            {normalizedQuery ? ` matching "${searchQuery.trim()}"` : ""}
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportMessages}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs bg-(--textColor) text-white rounded-xl font-semibold transition-all"
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
        {filteredMessages.length > 0 ? (
          filteredMessages.map((msg) => {
            const isVeryNew = new Date() - new Date(msg.createdAt) < 60000;

            return (
              <div
                key={msg._id}
                onClick={() => setSelectedMessage(msg)}
                className="bg-white p-5 rounded-2xl border border-(--lightSilver) active:scale-[0.98] transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-(--softAsh) flex items-center justify-center font-bold text-xs">
                      {msg.name.charAt(0)}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-(--headingPrimary)">
                        {msg.name}
                      </h3>

                      <p className="text-[11px] text-(--textMuted)">
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString(
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
                      msg.status === "pending"
                        ? "bg-orange-50 text-orange-600"
                        : msg.status === "archived"
                          ? "bg-(--textMuted) text-white"
                          : "bg-green-50 text-green-600"
                    }`}
                  >
                    {msg.status}
                  </span>
                </div>

                <p className="text-xs text-(--textColor) bg-(--softAsh) p-3 rounded-xl">
                  "{msg.message}"
                </p>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center border border-dashed border-(--lightSilver) rounded-2xl">
            <p className="text-sm text-(--textMuted)">
              {normalizedQuery
                ? `No messages found for "${searchQuery.trim()}".`
                : `No ${activeFilter} messages found`}
            </p>
          </div>
        )}
      </div>

      {/* DETAILS SIDEBAR */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          selectedMessage ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* OVERLAY */}
        <div
          className={`absolute inset-0 bg-(--textColor)/40 backdrop-blur-xs transition-opacity 
            duration-300 ${selectedMessage ? "opacity-100" : "opacity-0"}`}
          onClick={() => {
            setSelectedMessage(null);
            setIsReplyModalOpen(false);
          }}
        >
          {/* CONTENT */}
          <div
            className={`absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl 
              transform transition-transform duration-300 ease-in-out ${
                selectedMessage ? "translate-x-0" : "translate-x-full"
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMessage && (
              <section className="p-8 h-full flex flex-col relative">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedMessage.name}
                      </h2>
                      <p className="text-xs text-(--textMuted) font-medium">
                        {selectedMessage.email}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
                        selectedMessage.status === "pending"
                          ? "bg-orange-50 text-orange-600"
                          : selectedMessage.status === "archived"
                            ? "bg-(--textMuted) text-white"
                            : "bg-green-50 text-green-600"
                      }`}
                    >
                      {selectedMessage.status}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="p-2 hover:bg-(--softAsh) rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6 flex-1 overflow-y-auto scrollbar-hide">
                  <div className="space-y-2">
                    <button
                      onClick={() => setIsReplyModalOpen(true)}
                      className="w-full p-3 bg-(--textColor) text-white text-sm font-semibold rounded-xl 
                        flex items-center justify-center gap-2 hover:bg-(--textColor)/90 transition-colors"
                    >
                      <Mail size={16} />
                      Reply via Email
                    </button>

                    <button
                      onClick={() =>
                        toggleStatus(
                          selectedMessage._id,
                          selectedMessage.status,
                        )
                      }
                      disabled={selectedMessage.status === "archived"}
                      className={`flex items-center justify-center gap-2 w-full p-3 rounded-xl text-sm font-semibold border transition-all ${
                        selectedMessage.status === "archived"
                          ? "opacity-50 cursor-not-allowed border-gray-200 text-gray-400 bg-gray-50"
                          : selectedMessage.status === "pending"
                            ? "border-black text-black hover:bg-(--softAsh)"
                            : "border-green-600 text-green-600 bg-green-50"
                      }`}
                    >
                      <CheckCircle2 size={16} />
                      {selectedMessage.status === "archived"
                        ? "Archived (Restore to edit)"
                        : selectedMessage.status === "pending"
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
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold text-(--headingPrimary)">
                        Admin Reply
                      </h2>

                      <button
                        onClick={() =>
                          !sendingEmail && setIsReplyModalOpen(false)
                        }
                        className="w-10 h-10 flex justify-center items-center rounded-full bg-transparent 
                        hover:bg-(--softAsh) transition-all group"
                      >
                        <X size={22} className="group-hover:scale-110" />
                      </button>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg">
                        Reply to {selectedMessage.name}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-(--textMuted) mb-2">
                        Your Message
                      </label>

                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Input your response..."
                        className="w-full h-48 p-4 text-sm rounded-2xl bg-(--softAsh) focus:outline-none 
                        focus:ring-2 focus:ring-(--lightSilver) resize-none"
                      />

                      <div className="flex gap-3">
                        <button
                          onClick={() => setIsReplyModalOpen(false)}
                          className="flex-1 p-3.5 text-sm font-semibold border border-(--accent) 
                            hover:bg-(--softAsh) rounded-xl transition-all"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={sendEmailReply}
                          disabled={sendingEmail || !replyText.trim()}
                          className={`flex-2 p-3.5 text-sm font-semibold bg-(--textColor) text-white rounded-xl  transition-all ${
                            sendingEmail || !replyText.trim()
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-(--textColor)/90 active:scale-95"
                          }`}
                        >
                          {sendingEmail ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 size={18} className="animate-spin" />
                              Sending...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <Mail size={18} />
                              Send Reply
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 border border-(--textColor) rounded-2xl">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-(--textMuted) mb-2">
                      Subject
                    </h4>
                    <p className="text-sm leading-relaxed">
                      "{selectedMessage.subject}"
                    </p>
                  </div>

                  <div className="p-5 bg-(--softAsh) rounded-2xl">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-(--textMuted) mb-2">
                      Customer Message
                    </h4>
                    <p className="text-sm leading-relaxed">
                      "{selectedMessage.message}"
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-(--textMuted) font-bold mb-2">
                      Contact Info
                    </h4>

                    <div className="flex itesm-center justify-between p-3 bg-(--softAsh) rounded-xl">
                      <div className="flex items-center text-sm gap-2 font-medium">
                        <Mail size={14} className="text(--textMuted)" />
                        <p>{selectedMessage.email}</p>
                      </div>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedMessage.email);
                          alert("Copied to clipboard!");
                        }}
                        className="uppercase text-[10px] bg-white border border-(--lightSilver) px-2 py-1 rounded-md 
                        font-bold hover:bg-(--textColor) hover:text-white transition-all duration-300"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* QUICK ACTIONS */}
                  <div className="space-y-2">
                    <button
                      onClick={() => archiveMessage(selectedMessage)}
                      className={`flex items-center justify-center gap-2 p-3 font-semibold text-sm w-full rounded-xl 
                        border transition-colors ${
                          selectedMessage.status === "archived"
                            ? "border-(--textMuted) text-(--textMuted) hover:bg-(--softAsh)"
                            : "border-(--textColor) text-(--textColor) hover:bg-(--softAsh)"
                        }`}
                    >
                      <Archive size={16} />
                      {selectedMessage.status === "archived"
                        ? "Unarchive Message"
                        : "Archive Message"}
                    </button>

                    <button
                      onClick={() => setItemToDelete(selectedMessage)}
                      disabled={selectedMessage.status === "pending"}
                      className={`flex items-center justify-center gap-2 p-3 font-semibold text-sm w-full 
                        rounded-xl transition-all duration-300 ${
                          selectedMessage.status === "pending"
                            ? "bg-(--softAsh) text-(--textColor) cursor-not-allowed"
                            : "bg-red-500 text-white hover:bg-red-600"
                        }  `}
                    >
                      <Trash2 size={16} />{" "}
                      {selectedMessage.status === "pending"
                        ? "Resolve to Delete"
                        : "Delete Message"}
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      <DeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Message"
        description={`Are you sure you want to delete message?`}
      />
    </main>
  );
}
