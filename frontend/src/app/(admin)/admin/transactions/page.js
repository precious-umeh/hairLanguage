"use client";

import { useCallback, useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Filter,
  Loader2,
  ExternalLink,
  ChevronRight,
  User,
  X,
  CreditCard,
  AlertCircle,
  RefreshCw,
  Hash,
  Calendar,
  Layers,
} from "lucide-react";
import server from "@/app/(main)/utils/axiosClient";
import { useNotifications } from "@/providers/admin/notification-provider";
import toast, { Toaster } from "react-hot-toast";
import { formatPrice } from "@/app/(main)/utils/formatPrice";

export default function Transactions() {
  // States
  const [selectedTx, setSelectedTx] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { refreshAllCounts, lastUpdated } = useNotifications();

  // Fetch Transactions matching your exact logic
  const fetchTransactions = useCallback(async function (isSilent = false) {
    if (!isSilent) setLoading(true);
    try {
      const res = await server.get("/api/transactions/admin/all");
      if (res.data.success) {
        setTransactions(res.data.transactions || []);
      }
    } catch (error) {
      console.error("Fetch Transactions Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load transactions",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync data with notifications provider
  useEffect(() => {
    fetchTransactions(true);
  }, [lastUpdated, fetchTransactions]);

  // Run on initial mount
  useEffect(() => {
    fetchTransactions(false);
  }, [fetchTransactions]);

  // Filtering and Searching Logic
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.orderId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = activeFilter === "all" || tx.status === activeFilter;

    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const stats = {
    total: transactions
      .filter((t) => t.status === "success")
      .reduce((acc, t) => acc + t.amount, 0),
    successCount: transactions.filter((t) => t.status === "success").length,
    failedCount: transactions.filter((t) => t.status === "failed").length,
  };

  // Filter Options
  const filterOptions = [
    { id: "all", label: "All Records" },
    { id: "success", label: "Success" },
    { id: "pending", label: "Pending" },
    { id: "failed", label: "Failed" },
  ];

  return (
    <main className="space-y-6 text-(--textColor)">
      <Toaster position="top-left" />

      {/* TOP HEADING SECTION */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-sm font-bold text-(--textMuted) uppercase tracking-[0.2em]">
            Transaction Ledger
          </h1>
          <p className="text-xs text-(--textMuted) font-medium">
            Monitor payments, gateway channels, and automated account clearings.
          </p>
        </div>

        <button
          onClick={() => {
            fetchTransactions(false);
            refreshAllCounts?.();
          }}
          className="flex items-center justify-center gap-2 bg-(--textColor) text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-(--textColor)/90 active:scale-95 transition-all shadow-sm w-full sm:w-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />{" "}
          Manual Refresh
        </button>
      </section>

      {/* KPI CARDS SUMMARY STRIP */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-(--lightSilver) p-5 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-(--textMuted)">
            Settled Revenue
          </p>
          <p className="text-2xl font-bold text-(--accent) mt-0.5">
            {formatPrice(stats.total)}
          </p>
        </div>

        <div className="bg-white border border-(--lightSilver) p-5 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-(--textMuted)">
            Successful Transactions
          </p>
          <p className="text-2xl font-bold text-(--accent) mt-0.5">
            {stats.successCount} Trans
          </p>
        </div>

        <div className="bg-white border border-(--lightSilver) p-5 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-(--textMuted)">
            Logged Failures
          </p>
          <p className="text-2xl font-bold text-(--accent) mt-0.5">
            {stats.failedCount} Dropped
          </p>
        </div>
      </section>

      {/* SEARCH INPUT AND TOGGLE FILTER BAR */}
      <section className="bg-white border border-(--lightSilver) p-3 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between mb-6">
        <div className="w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search Reference, Email, or Order ID..."
            value={searchQuery}
            onChange={() => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-(--lightSilver) rounded-xl py-2.5 px-4 text-xs font-medium outline-none focus:border-(--accent) focus:bg-white transition-all"
          />
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center justify-center gap-2 py-2.5 px-4 border border-(--lightSilver) rounded-xl text-xs font-bold bg-white"
          >
            <Filter size={14} /> Filters ({activeFilter})
          </button>

          {/* Desktop Filters Grid Layout */}
          <div
            className={`md:flex gap-1.5 ${showFilters ? "flex flex-col" : "hidden"} md:flex-row`}
          >
            {filterOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setActiveFilter(opt.id);
                  setShowFilters(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  activeFilter === opt.id
                    ? "bg-(--textColor) text-white border-(--textColor)"
                    : "bg-white text-(--textMuted) border-(--lightSilver) hover:bg-(--softAsh)"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
