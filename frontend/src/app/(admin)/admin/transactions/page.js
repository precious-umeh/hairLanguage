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
import Link from "next/link";

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
        setTransactions(res.data.data || []);
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
      String(tx.orderId || "")
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

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
          <p className="text-xs text-(--textMuted) mt-1 font-medium">
            Showing {filteredTransactions.length} total{" "}
            {filteredTransactions === 1 ? "transaction" : "transactions"}
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
            onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Split Responsive Container Grid Layout matches Order layout split */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Main List Table */}
        <section
          className={`w-full ${selectedTx ? "lg:w-[60%]" : "w-full"} bg-white border border-(--lightSilver) rounded-2xl shadow-sm overflow-hidden transition-all duration-300`}
        >
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-3 text-(--textMuted)">
              <Loader2 size={28} className="animate-spin text-(--accent)" />
              <p className="text-xs font-bold tracking-wide">
                Syncing transaction balances...
              </p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <p className="p-20 text-center text-(--textMuted) text-xs font-medium">
              No transactions matched criteria.
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {/* Table Column Labels for desktop */}
              <div className="hidden sm:grid grid-cols-12 p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/70 border-b border-gray-50">
                <div className="col-span-3">Reference</div>
                <div className="col-span-4">Email</div>
                <div className="col-span-3">Amount</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              {/* Rows List */}
              {filteredTransactions.map((tx) => (
                <div
                  key={tx._id}
                  onClick={() => setSelectedTx(tx)}
                  className={`p-4 grid grid-cols-12 items-center gap-2 cursor-pointer transition-colors relative ${
                    selectedTx?._id === tx._id
                      ? "bg-gray-50"
                      : "hover:bg-gray-50/40"
                  }`}
                >
                  {/* Reference */}
                  <div className="col-span-7 sm:col-span-3 flex flex-col sm:block">
                    <span className="sm:hidden text-[9px] font-bold text-(--textMuted) uppercase tracking-wider mb-0.5">
                      Reference
                    </span>
                    <span className="font-mono font-bold text-xs text-(--accent) uppercase tracking-tight">
                      {tx.reference}
                    </span>
                  </div>

                  {/* Email */}
                  <div className="col-span-12 sm:col-span-4 order-3 sm:order-0 mt-1 sm:mt-0 text-xs text-(--textMuted) font-medium truncate">
                    {tx.email}
                  </div>

                  {/* Amount */}
                  <div className="col-span-5 sm:col-span-3 text-right sm:text-left flex flex-col sm:block">
                    <span className="sm:hidden text-[9px] font-bold text-(--textMuted) uppercase tracking-wider mb-0.5">
                      Amount
                    </span>
                    <span className="font-black text-xs text-(--accent)">
                      {formatPrice(tx.amount)}
                    </span>
                  </div>

                  {/* Status and Interactive Icon */}
                  <div className="col-span-12 sm:col-span-2 flex items-center justify-between sm:justify-end mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-dashed border-(--lightSilver) sm:border-0 order-4 sm:order-0">
                    <span className="sm:hidden text-[9px] font-bold text-(--textMuted) uppercase tracking-wider">
                      Gateway Status
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                          tx.status === "success"
                            ? "bg-green-50 text-green-700"
                            : tx.status === "pending"
                              ? "bg-orange-50 text-orange-700"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        {tx.status}
                      </span>
                      <ChevronRight
                        size={14}
                        className="text-(--coolGrey) hidden sm:block"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Detail Sidebar Inspector View Panel */}
        {selectedTx && (
          <section className="w-full lg:w-[40%] bg-white border border-(--lightSilver) rounded-2xl shadow-sm overflow-hidden sticky top-6 animate-zoom-in">
            {/* Header Toolbar */}
            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-(--accent)" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-(--textMuted)">
                  Audit Transaction
                </h2>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-(--textMuted) hover:text-(--accent) p-1 rounded-lg hover:bg-(--lightSilver) transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Main content metadata metrics listings */}
            <div className="p-6 space-y-6">
              {/* Financial Total Panel */}
              <div className="bg-gray-50 rounded-xl p-4 border border-(--lightSilver) flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-(--textMuted) uppercase tracking-wider block">
                    Gross Dispatched Total
                  </span>
                  <p className="text-2xl font-black mt-0.5 text-(--accent)">
                    {formatPrice(selectedTx.amount)}
                  </p>
                </div>
                <div>
                  {selectedTx.status === "success" && (
                    <CheckCircle2 className="text-green-600" size={24} />
                  )}
                  {selectedTx.status === "pending" && (
                    <AlertCircle className="text-orange-500" size={24} />
                  )}
                  {selectedTx.status === "failed" && (
                    <XCircle className="text-red-500" size={24} />
                  )}
                </div>
              </div>

              {/* Unique Structural Identifiers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-(--textMuted) uppercase tracking-wider flex items-center gap-1">
                    <Hash size={10} /> Order ID Link
                  </label>
                  <p className="font-mono text-xs font-bold text-(--accent) bg-gray-50 p-2 rounded-lg mt-1 truncate select-all">
                    {typeof selectedTx.orderId === "object" &&
                    selectedTx.orderId !== null
                      ? String(selectedTx.orderId._id)
                      : String(selectedTx.orderId || "-")}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-(--textMuted) uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={10} /> Settle Time
                  </label>
                  <p className="text-xs font-bold text-(--accent) mt-2">
                    {selectedTx.paidAt
                      ? new Date(selectedTx.paidAt).toLocaleString()
                      : "Unsettled Log / Pending"}
                  </p>
                </div>
              </div>

              {/* Expanded Payload Meta Attributes */}
              <div className="border-t border-dashed border-(--lightSilver) pt-5 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-(--textMuted)">
                    Paystack System ID
                  </span>
                  <span className="font-bold text-(--accent)">
                    {selectedTx.paystackId || "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-(--textMuted)">
                    Communication User
                  </span>
                  <span className="font-bold text-(--accent) flex items-center gap-1">
                    <User size={12} className="text-(--textMuted)" />{" "}
                    {selectedTx.email}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-(--textMuted)">
                    Acquirer Channel Source
                  </span>
                  <span className="font-bold text-(--accent) capitalize bg-(--lightSilver) px-2 py-0.5 rounded text-[10px]">
                    {selectedTx.channel || "Not Selected"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-(--textMuted)">
                    Gateway Token Ref
                  </span>
                  <span className="font-mono font-bold text-[11px] text-(--accent) uppercase tracking-tight">
                    {selectedTx.reference}
                  </span>
                </div>
              </div>

              {/* Bottom Quick Jump Action Link Button */}
              <div className="border-t border-(--lightSilver) pt-5">
                <Link
                  href={`/admin/orders?search=${
                    typeof selectedTx.orderId === "object" &&
                    selectedTx.orderId !== null
                      ? selectedTx.orderId._id
                      : selectedTx.orderId
                  }`}
                  className="w-full flex items-center justify-center gap-2 bg-(--textColor) text-white p-3.5 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  <ExternalLink size={14} /> Inspect Associated Order
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
