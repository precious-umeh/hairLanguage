"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import server from "../../utils/axiosClient";
import { Package, ChevronLeft, Hash } from "lucide-react";
import { formatPrice } from "../../utils/formatPrice";

export default function TrackOrder() {
  const [showDetails, setShowDetails] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState([]);
  const [formData, setFormData] = useState({
    orderId: "",
    email: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await server.post("/api/orders/lookup", formData);

      setOrderData(response.data.data);

      toast.success("Order details retrieved successfully");

      setShowDetails(true);

      setFormData({ orderId: "", email: "" });
    } catch (error) {
      console.error("Order Details Error:", error);
      toast.error(
        error.response?.data?.message || "Invalid Order ID or Email Address",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Status Badge Helper
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-orange-100 text-orange-700",
      paid: "bg-blue-100 text-blue-700",
      shipped: "bg-purple-100 text-purple-700",
      cancelled: "bg-red-100 text-red-700",
      delivered: "bg-green-100 text-green-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <main className="w-full min-h-screen px-[5vw] py-20 flex items-center justify-center bg-gray-50/50">
      <Toaster position="top-left" />

      <div className="max-w-2xl mx-auto w-full transition-all duration-500">
        {!showDetails ? (
          // ===== FORM VIEW =====
          <div className="bg-white border border-(--lightSilver) rounded-2xl shadow-xl p-8 md:p-12">
            <div className="space-y-6 w-full fade-up">
              <div className="text-center space-y-2">
                <h2 className="font-bold text-center text-(--textColor) text-3xl">
                  Track Order
                </h2>

                <p className="text-sm font-medium text-(--textMuted)">
                  Enter your details to see your order status and history.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="orderId"
                    className="block font-bold text-xs uppercase traking-wider text-(--textColor)"
                  >
                    Order ID
                  </label>
                  <input
                    id="orderId"
                    type="text"
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleChange}
                    placeholder="e.g. 64f1..."
                    required
                    className="w-full border-2 border-gray-100 focus:border-(--accent) p-3.5 rounded-xl outline-none transition-all"
                  />
                  <span className="text-[11px] text-(--textMuted) block mt-1">
                    You can find your 24-character Order ID in the confirmation
                    email sent to you.
                  </span>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block font-bold text-xs uppercase tracking-wider text-(--textColor)"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="example@email.com"
                    className="w-full border-2 border-gray-100 focus:border-(--accent) p-3.5 rounded-xl outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isloading}
                  className="w-full bg-(--accent) py-4 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-(--accent)/30 transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  {isloading ? "Searching Database..." : "Track My Package"}
                </button>
              </form>
            </div>
          </div>
        ) : (
          // ===== DETAILS VIEW =====
          <div className="animate-zoom-in">
            <button
              onClick={() => setShowDetails(false)}
              className="flex items-center gap-2 text-sm font-bold text-(--textMuted) hover:text-(--accent) transition-colors mb-4"
            >
              <ChevronLeft size={18} /> Back to Search
            </button>

            <div className="bg-white border border-(--lightSilver) rounded-2xl shadow-xl overflow-hidden">
              {/* === HEADER === */}
              <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
                <div>
                  <div className="flex items-center gap-2 text-(--textMuted) mb-1">
                    <Hash size={14} />
                    <span className="text-xs font-mono uppercase">
                      {orderData?._id}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold flex items-center gap-2">
                    Order Details
                    <span
                      className={`text-[10px] uppercase px-2 py-1 rounded-full ${getStatusColor(orderData?.status)}`}
                    >
                      {orderData?.status}
                    </span>
                  </h3>
                </div>

                <div className="text-right">
                  <p className="text-xs text-(--textMuted) font-medium">
                    Placed on
                  </p>
                  <p className="text-sm font-bold">
                    {new Date(orderData?.createdAt).toLocaleDateString(
                      "en-US",
                      { dateStyle: "long" },
                    )}
                  </p>
                </div>
              </div>

              {/* === ITEMS LIST === */}
              <div className="p-6 space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-(--textMuted)">
                  Items Ordered
                </p>

                {orderData.items.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                          <Package size={20} className="text-gray-400" />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-(--textColor)">
                            {item.productName}
                          </p>
                          <p className="text-[11px] text-(--textMuted)">
                            {item.size && `Size: ${item.size}"`}{" "}
                            {item.colorName && `| Color: ${item.colorName}`} |
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm font-bold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* === SHIPPING & TOTAL */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-(--textMuted)">
                    Shipping To
                  </p>
                  <div className="text-sm">
                    <p className="font-bold">
                      {orderData?.shippingAddress.phone}
                    </p>
                    <p className="text-(--textMuted)">
                      {orderData?.shippingAddress.address}
                    </p>
                    <p className="text-(--textMuted)">
                      {orderData?.shippingAddress.city},{" "}
                      {orderData?.shippingAddress.state}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col justify-end items-end space-y-1">
                  <p className="text-xs font-bold text-(--textMuted)">
                    Total Amount Paid
                  </p>
                  <p className="text-3xl font-black text-(--accent)">
                    {formatPrice(orderData?.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
