"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Package,
  Truck,
  XCircle,
  Filter,
  Loader2,
  Trash2,
  EyeOff,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  User,
  Download,
  X,
  PackageCheck,
} from "lucide-react";
import server from "@/app/(main)/utils/axiosClient";
import { useNotifications } from "@/providers/admin/notification-provider";
import toast, { Toaster } from "react-hot-toast";
import DeleteModal from "../components/deleteModal";
import { formatPrice } from "@/app/(main)/utils/formatPrice";
import { useSearchParams } from "next/navigation";
import { useAdminSearch } from "@/providers/admin/admin-search-provider";

export default function Orders() {
  const searchParams = useSearchParams();
  const targetOrderId = searchParams.get("search");

  // States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { refreshAllCounts, lastUpdated } = useNotifications();
  const { searchQuery } = useAdminSearch();

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Fetch Orders
  const fetchOrders = useCallback(async function (isSilent = false) {
    if (!isSilent) setLoading(true);

    try {
      const response = await server.get("/api/orders/admin/all");

      setOrders(response.data.data || []);

      // if (!isSilent) refreshAllCounts();
    } catch (error) {
      console.error("Order Fetch Error:", error);
      toast.error(error.response?.data?.message || "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // NOTIFICATION SYNC
  useEffect(() => {
    fetchOrders(true);
  }, [lastUpdated, fetchOrders]);

  // Handle auto-selection from transaction redirection page
  useEffect(() => {
    if (targetOrderId && orders.length > 0) {
      //Find order matching the ID in the URL string
      const matchedOrder = orders.find(
        (order) => String(order._id) === String(targetOrderId),
      );

      if (matchedOrder) {
        setSelectedOrder(matchedOrder);
        setActiveFilter("all");
      }
    }
  }, [targetOrderId, orders]);

  // Update Status
  const handleUpdateStatus = async function (id, newStatus) {
    setIsUpdating(true);

    try {
      const response = await server.patch(`/api/orders/admin/status/${id}`, {
        status: newStatus,
      });

      if (response.data.success) {
        toast.success(`Order marked as ${newStatus}`);

        setOrders((prev) =>
          prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o)),
        );

        setSelectedOrder((prev) =>
          prev?._id === id ? { ...prev, status: newStatus } : prev,
        );

        refreshAllCounts();
      }
    } catch (error) {
      console.error("Status Update Error:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Order
  const handleDelete = async function () {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      const response = await server.delete(
        `/api/orders/admin/remove/${itemToDelete?._id}`,
      );

      if (response.data.success) {
        toast.success("Order deleted successfully.");

        setOrders((prev) => prev.filter((o) => o._id !== itemToDelete?._id));

        setSelectedOrder(null);

        setItemToDelete(null);

        refreshAllCounts();
      }
    } catch (error) {
      console.error("Delete Order Error:", error);
      toast.error(error.response?.data?.message || "Failed to delete order");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter Orders
  const filterTab = [
    "all",
    "pending",
    "paid",
    "shipped",
    "cancelled",
    "delivered",
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      activeFilter === "all" ? true : order.status === activeFilter;

    if (!normalizedQuery) return matchesStatus;

    const haystack = [
      order._id,
      order.email,
      order.status,
      order.shippingAddress?.address,
      order.shippingAddress?.city,
      order.shippingAddress?.state,
      order.shippingAddress?.phone,
      ...(order.items || []).map((item) => item.productName),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matchesStatus && haystack.includes(normalizedQuery);
  });

  const getStatusStyles = (status) => {
    switch (status) {
      case "paid":
        return "bg-blue-50 text-blue-600";

      case "pending":
        return "bg-orange-50 text-orange-600";

      case "shipped":
        return "bg-purple-50 text-purple-600";

      case "cancelled":
        return "bg-red-50 text-red-600";

      case "delivered":
        return "bg-green-50 text-green-600";

      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  return (
    <main className="space-y-6">
      <Toaster position="top-left" />

      {/* HEADER SECTION */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-sm font-bold text-(--textMuted) uppercase tracking-[0.2em]">
            Order Management
          </h1>
          <p className="text-xs text-(--textMuted) font-medium">
            Manage wig sales and shipping status
          </p>
          <p className="text-xs text-(--textMuted) mt-1 font-medium">
            Showing {filteredOrders.length} total{" "}
            {filteredOrders.length === 1 ? "order" : "orders"}
            {normalizedQuery ? ` matching "${searchQuery.trim()}"` : ""}
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs bg-(--textColor) text-white rounded-xl font-semibold transition-all">
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
          className="relative z-10 flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs bg-white border border-(--lightSilver) rounded-xl hover:bg-(--softAsh) font-semibold transition-all"
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
          <div className="flex gap-4 overflow-x-auto whitespace-nowrap border-b border-(--lightSilver) mb-4 scrollbar-hide">
            {filterTab.map((tab) => (
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
        <section className={`space-y-4`}>
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-(--accent)" />
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                onClick={() => setSelectedOrder(order)}
                className={`bg-white p-5 rounded-2xl border border-(--lightSilver) transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98]`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-3 rounded-full font-semibold ${getStatusStyles(order.status)}`}
                    >
                      <Package
                        size={20}
                        className={getStatusStyles(order.status)}
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-(--headingPrimary)">
                        #{order._id.slice(-8).toUpperCase()}
                        {order.deletedByUser && (
                          <span
                            className="bg-red-50 text-red-600 text-[8px] px-1.5 py-0.5 
                              rounded-sm border border-red-100 font-bold uppercase ml-2"
                          >
                            User Deleted
                          </span>
                        )}
                      </h3>

                      <p className="text-[11px] text-(--textMuted) truncate max-w-35 sm:max-w-none">
                        {order.email}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 px-2 py-1 rounded-lg text-[9px] font-bold uppercase ${getStatusStyles(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 bg-(--softAsh) p-3 rounded-xl min-w-0">
                  <div className="">
                    <p className="font-bold text-sm text-(--textColor) wrap-break-word">
                      {formatPrice(order.totalAmount)}
                    </p>
                    <p className="text-[10px] uppercase text-(--textMuted) font-medium">
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-(--textMuted)" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center border border-dashed border-(--lightSilver) rounded-2xl">
              <p className="text-sm text-(--textMuted)">
                {normalizedQuery
                  ? `No orders found for "${searchQuery.trim()}".`
                  : `No ${activeFilter} orders found`}
              </p>
            </div>
          )}
        </section>
      </div>

      {/* DETAILS SIDEBAR */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          selectedOrder ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* OVERLAY */}
        <div
          className={`absolute inset-0 bg-(--textColor)/40 backdrop-blur-xs transition-opacity duration-300 ${
            selectedOrder ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className={`absolute top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
              selectedOrder ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedOrder && (
              <section className="py-8 h-full flex flex-col relative">
                {/* <div className="flex justify-between items-start mb-8"></div> */}
                <div className="p-6 border-b border-(--coolGrey) flex justify-between items-center bg-gray-50">
                  <h2 className="font-bold">Order Details</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyles(
                      selectedOrder.status,
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>

                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-(--lightSilver) rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-4 sm:p-8 space-y-6 flex-1 overflow-y-auto scrollbar-hide">
                  {/* ITEMS LIST */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase text-(--textMuted)">
                      Items Summary
                    </p>
                    {selectedOrder.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-50 p-3 rounded-xl"
                      >
                        <div className="text-sm">
                          <p className="font-bold line-clamp-2">
                            {item.productName}
                          </p>
                          <p className="text-xs text-(--textMuted)">
                            Size: {item.size}" | Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-bold text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t border-(--coolGrey) font-black text-(--accent)">
                      <span>Total Amount</span>
                      <span>{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>

                  {/* SHIPPING INFO */}
                  <div className="p-4 bg-(--accent)/20 rounded-2xl space-y-2">
                    <p className="text-xs font-bold text-(--textMuted) flex items-center gap-1">
                      <Truck size={14} /> SHIPPING ADDRESS
                    </p>
                    <p className="text-sm font-medium">
                      {selectedOrder.shippingAddress.address}
                    </p>
                    <p className="text-xs">
                      {selectedOrder.shippingAddress.city},{" "}
                      {selectedOrder.shippingAddress.state}
                    </p>
                    <p className="text-xs font-bold">
                      {selectedOrder.shippingAddress.phone}
                    </p>
                  </div>

                  {/* ACTION CONTROLS */}
                  <div className="space-y-3 pt-4">
                    <p className="text-xs font-bold uppercase text-(--textMuted)">
                      Update Status
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        disabled={
                          isUpdating || selectedOrder.status === "shipped"
                        }
                        onClick={() =>
                          handleUpdateStatus(selectedOrder._id, "shipped")
                        }
                        className="flex items-center justify-center gap-2 bg-purple-600 text-white p-3 rounded-xl text-xs font-bold hover:bg-purple-700 disabled:opacity-50"
                      >
                        <Truck size={16} /> Mark Shipped
                      </button>
                      <button
                        disabled={isUpdating || selectedOrder.status === "paid"}
                        onClick={() =>
                          handleUpdateStatus(selectedOrder._id, "paid")
                        }
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                      >
                        <CheckCircle2 size={16} /> Mark Paid
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        disabled={
                          isUpdating || selectedOrder.status === "delivered"
                        }
                        onClick={() =>
                          handleUpdateStatus(selectedOrder._id, "delivered")
                        }
                        className="flex items-center justify-center gap-2 bg-green-600 text-white p-3 rounded-xl text-xs font-bold hover:bg-green-700 disabled:opacity-50"
                      >
                        <PackageCheck size={16} /> Mark Delivered
                      </button>
                      <button
                        disabled={
                          isUpdating || selectedOrder.status === "cancelled"
                        }
                        onClick={() =>
                          handleUpdateStatus(selectedOrder._id, "cancelled")
                        }
                        className="flex items-center justify-center gap-2 bg-gray-600 text-white p-3 rounded-xl text-xs font-bold hover:bg-gray-700 disabled:opacity-50"
                      >
                        <XCircle size={16} /> Mark Cancelled
                      </button>
                    </div>

                    <button
                      onClick={() => setItemToDelete(selectedOrder)}
                      className="w-full mt-4 flex items-center justify-center gap-2 p-3 text-red-500 border border-red-100 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} /> Delete Permanently
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Permanently Delete Order?"
        description="This will remove the order from the system entirely. This action cannot be undone."
      />
    </main>
  );
}
