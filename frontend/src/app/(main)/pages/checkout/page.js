"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/providers/public/cart-provider";
import server, { BASE_URL } from "../../utils/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import { formatPrice } from "../../utils/formatPrice";
import { Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { cartData, clearCart, removeFromCart, getCart } = useCart();
  const [loading, setLoading] = useState(false);

  // Local state for items users want to pay for immediately
  const [checkoutItems, setCheckoutItems] = useState([]);

  // Sync local state and cartData on first load
  useEffect(() => {
    if (cartData.items.length > 0 && checkoutItems.length === 0) {
      setCheckoutItems(cartData.items);
    }
  }, [cartData.items, checkoutItems.length]);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    address: "",
    state: "",
    city: "",
    phone: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Calculate subtotal based only on checkoutItems raw prices
  const subtotal = checkoutItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  // Calculate Tax Fee
  const taxFee = Math.round(subtotal * 0.075);

  // Delivery Fee
  const deliveryFee =
    checkoutItems.length > 0 && formData.state.trim().toLowerCase() === "lagos"
      ? 4000
      : 8000;

  // Grand Total
  const grandTotal = subtotal + taxFee + deliveryFee;

  // Remove items locally
  const removeItemsLocally = (index) => {
    // Removes items only from the checkout summary view
    const updated = checkoutItems.filter((_, i) => i !== index);
    setCheckoutItems(updated);
    toast.success("Item removed from this order.");
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    // if (cartData.items.length === 0) return toast.error("Cart is empty");
    if (checkoutItems.length === 0) return toast.error("Your order is empty.");

    setLoading(true);
    try {
      // Prepare the Order Payload
      const orderPayload = {
        // items: cartData.items.map((item) => ({

        // Only send the items in the local checkout state
        items: checkoutItems.map((item) => ({
          productId: item.productId._id, // Handle populated ID
          productName: item.productId.productName,
          size: item.selectedLength,
          colorName: item.selectedColor?.name || "Standard",
          colorId: item.selectedColor?._id || null,
          quantity: item.quantity,
        })),
        shippingAddress: {
          address: formData.address,
          state: formData.state,
          city: formData.city,
          phone: formData.phone,
        },
        email: formData.email,
        sessionId: localStorage.getItem("hair_language_session"),
      };

      const orderRes = await server.post(
        "/api/orders/create-order",
        orderPayload,
      );
      const { orderId } = orderRes.data;

      // Initialize Payment
      const paymentRes = await server.post("/api/transactions/initialize", {
        orderId,
      });

      // Redirect to paystack
      if (paymentRes.data.success) {
        // await clearCart();

        // Remove only the items the user bought
        for (const item of checkoutItems) {
          await removeFromCart(
            item.productId._id,
            item.selectedLength,
            item.selectedColor?._id || item.selectedColor,
          );
        }

        window.location.href = paymentRes.data.data.authorization_url;
      }
    } catch (error) {
      console.error("Checkout Error:", error);

      const msg = error.response?.data?.message || "Checkout failed.";
      toast.error(msg);
      if (msg.toLowerCase().includes("stock")) getCart();
      setLoading(false);
    }
  };

  return (
    <main className="px-[5vw] pt-24 pb-10 min-h-screen bg-(--softAsh)/30">
      {/* <Toaster position="top-left" /> */}

      <h1 className="text-3xl font-bold mb-8 text-(--textColor)">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Shipping Form */}
        <form
          onSubmit={handleCheckout}
          className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-(--lightSilver)/50"
        >
          <h2 className="text-xl font-bold mb-4">Shipping Information</h2>

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            onChange={handleInputChange}
            className="w-full p-3 border border-(--lightSilver) rounded-lg outline-(--accent) bg-(--softAsh)/50"
          />

          <input
            type="text"
            name="address"
            placeholder="Shipping Address"
            required
            onChange={handleInputChange}
            className="w-full p-3 border border-(--lightSilver) rounded-lg outline-(--accent) bg-(--softAsh)/50"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="state"
              placeholder="State"
              required
              onChange={handleInputChange}
              className="w-full p-3 border border-(--lightSilver) rounded-lg outline-(--accent) bg-(--softAsh)/50"
            />

            <input
              type="text"
              name="city"
              placeholder="City"
              required
              onChange={handleInputChange}
              className="w-full p-3 border border-(--lightSilver) rounded-lg outline-(--accent) bg-(--softAsh)/50"
            />
          </div>

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            required
            onChange={handleInputChange}
            className="w-full p-3 border border-(--lightSilver) rounded-lg outline-(--accent) bg-(--softAsh)/50"
          />

          <button
            type="submit"
            disabled={loading || checkoutItems.length === 0}
            className="w-full bg-(--accent) text-white py-4 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : `Pay ${formatPrice(grandTotal)}`}
          </button>
        </form>

        {/* Order Summary Sidebar */}
        <div className="border border-(--accent)/10 bg-white p-6 rounded-2xl shadow-sm h-fit">
          <h2 className="text-xl font-bold mb-4 text-(--textColor)">
            Order Summary
          </h2>

          {checkoutItems.length > 0 ? (
            <>
              <div className="space-y-4 max-h-100 overflow-y-auto pr-2">
                {checkoutItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-4 items-center group border-b border-(--softAsh) pb-4 last:border-0"
                  >
                    <img
                      src={`${BASE_URL}${item.productId.images[0]}`}
                      alt={item.productId.productName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <p className="font-semibold text-sm line-clamp-1">
                        {item.productId.productName}
                      </p>
                      <p className="text-xs text-(--textMuted)">
                        {item.selectedLength}" inch / {item.selectedColor?.name}{" "}
                        / {item.quantity}
                      </p>

                      {/* Local Remove Button */}
                      <button
                        onClick={() => removeItemsLocally(i)}
                        className="mt-1 py-1 text-red-500 text-xs flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200"
                      >
                        <Trash2 size={12} /> <span>Remove from order</span>
                      </button>
                    </div>

                    <p className="font-bold text-sm self-start">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Subtotal, VAT, DeliveryFee */}
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2.5 text-xs font-semibold text-(--textMuted)">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="text-(--textColor)">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Value Added Tax (7.5% VAT)</span>
                  <span className="text-(--textColor)">
                    {formatPrice(taxFee)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-(--textColor)">
                    {formatPrice(deliveryFee)}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-dashed border-(--softAsh) flex justify-between items-center">
                <span className="text-lg">Total Amount</span>
                <span className="text-2xl font-black text-(--accent)">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </>
          ) : (
            // Empty State
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-(--softAsh) rounded-full flex items-center justify-center">
                <ShoppingBag className="text-(--textMuted) w-8 h-8 opacity-20" />
              </div>

              <div>
                <p className="font-bold text-(--textColor)">
                  Nothing to pay for
                </p>
                <p className="text-sm text-(--textMuted)">
                  Your order list is empty
                </p>
              </div>

              <Link
                href="/shop"
                className="text-sm font-bold text-(--accent) underline underline-offset-4 animate-pulse"
              >
                Continue Shopping
              </Link>
            </div>
          )}
        </div>

        {/* <div className="bg-(--coolGrey) p-6 rounded-xl h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

          {cartData.items.map((item, i) => (
            <div key={i} className="flex justify-between py-2 border-b">
              <span>
                {item.productId.productName} (x{item.quantity})
              </span>
              <span>{formatPrice(item.productId.price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-xl mt-4">
            <span>Total</span>
            <span>{formatPrice(cartData.totalPrice)}</span>
          </div>
        </div> */}
      </div>
    </main>
  );
}
