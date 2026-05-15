"use client";

import { X, ShoppingBag, Trash2, Handbag } from "lucide-react";
import { useCart } from "@/providers/public/cart-provider";
import QuantitySelector, { CartQuantitySelector } from "./quantitySelector";
import Link from "next/link";
import { formatPrice } from "../../utils/formatPrice";
import { useEffect } from "react";
import { BASE_URL } from "../../utils/axiosClient";
import { useRouter } from "next/navigation";

export default function CartSidebar() {
  const router = useRouter();
  const {
    cartSlide,
    closeCart,
    cartData,
    updateCart,
    removeFromCart,
    clearCart,
  } = useCart();

  useEffect(() => {
    document.body.style.overflow = cartSlide ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [cartSlide]);

  const normalizeColor = (color) => {
    if (!color) return null;
    if (typeof color === "object") return color._id;
    return color;
  };

  const normalizeLength = (length) => {
    if (!length) return null;
    return Number(length);
  };

  return (
    <main>
      <div
        className={`fixed inset-0 bg-(--textColor)/40 backdrop-blur-sm z-50 transition-opacity duration-500 ${
          cartSlide
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      >
        {/* Sidebar Panel */}
        <aside
          onClick={(e) => e.stopPropagation()}
          className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-60 shadow-2xl 
            transition-transform duration-500 ease-in-out transform ${
              cartSlide ? "translate-x-0" : "translate-x-full"
            } flex flex-col`}
        >
          {/* Header */}
          <div className="p-6 flex items-center justify-between border-b border-(--lightSilver)">
            <div className="flex items-center gap-2">
              <Handbag size={20} />
              <h2 className="text-xl font-medium uppercase tracking-tight">
                Your Cart
              </h2>
              <span className="text-sm text-(--textMuted)">
                ({cartData.totalItems})
              </span>
            </div>

            <button
              onClick={closeCart}
              className="p-2 hover:bg-(--softAsh) rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-6">
            {cartData.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-(--textMuted) space-y-4">
                <Handbag size={48} className="animate-spin opacity-20" />
                <p>Your cart is empty</p>
                <button
                  onClick={closeCart}
                  className="text-(--headingPrimary) underline underline-offset-4 font-medium animate-pulse"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cartData.items.map((item) => {
                return (
                  <div
                    // key={`${item.productId._id || item.productId}-${item.selectedLength || "no-length"}-${item.selectedColor?._id || item.selectedColor || "natural"}`}
                    key={item._id}
                    className="flex gap-4 border-b border-(--softAsh) pb-6"
                  >
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-(--softAsh) rounded-lg overflow-hidden shrink-0">
                      <img
                        src={
                          `${BASE_URL}${item.productId.images?.[0]}` ||
                          item.image
                        }
                        alt={item.productId.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-(--headingPrimary) line-clamp-1">
                            {item.productName || item.productId?.productName}
                          </h3>
                          <p className="text-xs text-(--textMuted) mt-1">
                            {item.selectedLength}" |{" "}
                            {item.selectedColor?.name || "Natural"}
                          </p>
                        </div>

                        <button
                          title="Remove Item"
                          onClick={() =>
                            removeFromCart(
                              item.productId._id,
                              item.selectedLength,
                              item.selectedColor?._id || item.selectedColor,
                            )
                          }
                          className="text-(--textMuted) hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        {/* <CartQuantitySelector
                          count={item.quantity}
                          onUpdate={(newVal) =>
                            updateCart(
                              item.productId._id || item.productId,
                              newVal,
                              // item.selectedLength || null,
                              normalizeLength(item.selectedLength),
                              normalizeColor(item.selectedColor),
                              // item.selectedColor?._id ||
                              //   item.selectedColor ||
                              //   null,
                            )
                          }
                        /> */}
                        <QuantitySelector
                          variant="compact"
                          count={item.quantity}
                          onChange={(newVal) =>
                            updateCart(
                              item.productId._id || item.productId,
                              newVal,
                              normalizeLength(item.selectedLength),
                              normalizeColor(item.selectedColor),
                            )
                          }
                        />
                        <p className="font-medium text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer / Summary */}
          {cartData.items.length > 0 && (
            <div className="p-6 bg-(--softAsh)/50 border-t border-(--lightSilver) space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    clearCart();
                    closeCart();
                  }}
                  className="bg-(--accent) text-white font-medium text-sm py-1.5 px-3 
                    rounded-lg hover:opacity-90 active:scale-[0.98] transform transition-transform"
                >
                  Clear Cart
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-(--textMuted)">Subtotal</span>
                <span className="text-xl font-semibold tracking-tight">
                  {formatPrice(cartData.totalPrice)}
                </span>
              </div>
              <p className="text-[10px] text-(--textMuted) uppercase tracking-widest text-center">
                Shipping & taxes calculated at checkout
              </p>
              <button
                className="w-full py-4 bg-(--textColor) text-white font-medium rounded-lg hover:opacity-90 active:scale-[0.98] transform transition-transform"
                onClick={() => {
                  closeCart();
                  router.push("/pages/checkout");
                }}
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
