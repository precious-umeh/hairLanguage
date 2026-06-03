"use client";

import server from "@/app/(main)/utils/axiosClient";
import {
  Calendar,
  Copy,
  Download,
  Loader2,
  Mail,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import DeleteModal from "../components/deleteModal";
import { useAdminSearch } from "@/providers/admin/admin-search-provider";
import { exportToCSV } from "../components/csvExporter";

export default function NewsLetter() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { searchQuery } = useAdminSearch();
  const normalizedQuery = searchQuery.trim().toLowerCase();

  // FETCH SUBSCRIBERS
  const fetchSubscribers = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const response = await server.get("/api/newsletter");
      setSubscribers(response.data?.data || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error(`Error fetching subscribers: `, error.message);
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  //INITIAL LOAD
  useEffect(() => {
    fetchSubscribers();

    const interval = setInterval(() => {
      fetchSubscribers(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // DELETE SUBSCRIBER
  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      await server.delete(`/api/newsletter/${itemToDelete._id}`);
      toast.success("Subscriber removed successfully.");
      fetchSubscribers(true);
      setItemToDelete(null);
    } catch (error) {
      toast.error("Failed to delete");
      console.error(
        `Error removing subscriber: ${error.response?.data?.message || error.message}`,
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // FILTER SUBSCRIBERS
  const filteredSubscribers = subscribers.filter((sub) => {
    if (!normalizedQuery) return true;
    return sub.email?.toLowerCase().includes(normalizedQuery);
  });

  // COPY MALL MAILS TO CLIPBOARD
  const copyAllMails = () => {
    const source = normalizedQuery ? filteredSubscribers : subscribers;
    const allMails = source.map((s) => s.email).join(", ");
    navigator.clipboard.writeText(allMails);
    toast.success("All mails copied to clipboard!");
  };

  // CSV EXPORT HANDLER
  const handleExportNewsletter = () => {
    if (!filteredSubscribers || filteredSubscribers.length === 0) {
      toast.error("No subscriber data available to export.");
      return;
    }

    const dataToExport = filteredSubscribers.map((sub, index) => {
      return {
        "S/N": index + 1,
        "Subscriber ID": sub._id.toUpperCase(),
        "Email Address": sub.email,
        "Subscribed Date": sub.subscribedAt
          ? new Date(sub.subscribedAt).toLocaleDateString("en-NG", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "N/A",
      };
    });

    exportToCSV(dataToExport, "hair-language-newsletter-subscribers.csv");
  };

  // LOADING STATE
  if (loading)
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-(--accent)" size={40} />
      </div>
    );

  return (
    <main className="space-y-10">
      <Toaster position="top-left" />

      {/* HEADER SECTION */}
      <div className="space-y-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-sm font-bold uppercase text-(--textMuted) tracking-[0.2em]">
              Newsletter Community
            </h2>

            <div className="flex items-center gap-4 mt-2">
              <Users size={22} className="text-(--accent)" />
              <span className="text-xl font-bold">{subscribers.length}</span>
              <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md font-bold">
                {filteredSubscribers.length === 1
                  ? "Active Subscriber"
                  : "Active Subscribers"}
              </span>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={copyAllMails}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 
            text-xs border border-(--lightSilver) rounded-xl hover:bg-(--softAsh) font-bold 
            transition-all"
            >
              <Copy size={14} /> <span className="">Copy All</span>
            </button>
            <button
              onClick={handleExportNewsletter}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 
            text-xs bg-(--textColor) text-white rounded-xl font-bold hover:opacity-90 
            transition-all"
            >
              <Download size={14} /> Export{" "}
              {/* <span className="hidden md:inline">CSV</span> */}
            </button>
          </div>
        </div>

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
      </div>

      {/* SUBSCRIBERS LISTS */}
      {filteredSubscribers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredSubscribers.map((sub) => {
            return (
              <div
                key={sub._id}
                className="group relative bg-white p-5 rounded-2xl border border-(--lightSilver) 
                  md:hover:border-(--accent) shadow-sm md:hover:shadow-md transition-all duration-300"
              >
                {/* TOP RIGHT ACTIONS */}
                <div className="absolute top-4 right-4 flex gap-1 lg:opacity-0 lg:group-hover:opacity-100">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(sub.email);
                      toast.success("Email copied!");
                    }}
                    className="p-2 text-(--textMuted) hover:text-(--textColor) hover:bg-(--softAsh) 
                    rounded-lg transition-all"
                    title="Copy Email"
                  >
                    <Copy size={14} />
                  </button>

                  <button
                    onClick={() => setItemToDelete(sub)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg 
                      transition-all"
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* CONTENT */}
                <div className="space-y-4">
                  <div
                    className="w-10 h-10 rounded-full bg-(--softAsh) flex items-center justify-center 
                  text-(--accent) md:group-hover:bg-(--accent) md:group-hover:text-white transition-all"
                  >
                    <Mail size={18} />
                  </div>

                  <div className="space-y-1">
                    <p
                      className="text-sm font-bold text-(--textColor) truncate pr-8"
                      title={sub.email}
                    >
                      {sub.email}
                    </p>
                    <div
                      className="flex items-center gap-1.5 text-[10px] text-(--textMuted) font-semibold
                     uppercase tracking-wider"
                    >
                      <Calendar size={12} />
                      {new Date(sub.subscribedAt).toLocaleDateString("en-NG", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-(--textMuted) font-semibold text-sm">
            {normalizedQuery
              ? `No subscribers found for "${searchQuery.trim()}".`
              : "No active subscribers found."}
          </p>
        </div>
      )}

      {/* DELETE MODAL */}
      <DeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Remove Subscriber?"
        description={`Are you sure you want to remove ${itemToDelete?.email}?`}
      />
    </main>
  );
}
