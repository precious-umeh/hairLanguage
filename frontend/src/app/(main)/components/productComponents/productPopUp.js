"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "../../utils/formatPrice";
import { MoveRight, X } from "lucide-react";
import QuantitySelector from "./quantitySelector";
import ColorSelector from "./colorSelector";
import { BASE_URL } from "../../utils/axiosClient";
import { useCart } from "@/providers/public/cart-provider";
import { useRouter } from "next/navigation";

export default function ProductPopup({ product, onClose }) {
  const router = useRouter();
  const { addToCart, loading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(
    product.availableColors && product.availableColors.length > 0
      ? product.availableColors[0]
      : null,
  );
  const [selectedLength, setSelectedLength] = useState(
    product.lengths && product.lengths.length > 0
      ? product.lengths[0]
      : { size: "", price: product.price },
  );

  const handleAddToCart = function () {
    addToCart(product._id, quantity, selectedLength.size, selectedColor?._id);
    onClose();
  };

  useEffect(() => {
    // If the new selected length has stock, reset quantity to 1
    if (selectedLength?.inventory > 0) {
      setQuantity(1);
    } else {
      // If it's out of stock, set quantity to 0
      setQuantity(0);
    }

    // This effect runs every time the user picks a different size/length
  }, [selectedLength]);

  if (!product) return null;

  useEffect(() => {
    document.body.style.overflow = product ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [product]);

  const handleBuyNow = async () => {
    try {
      // Add to cart first
      await addToCart(
        product._id,
        quantity,
        selectedLength.size,
        selectedColor?._id,
        false,
      );

      // Close popup
      onClose();

      // Immediately go to checkout
      router.push("/pages/checkout");
    } catch (error) {
      console.error("Buy Now Error:", error);
    }
  };

  return (
    <main
      onClick={onClose}
      className={`fixed inset-0 py-8 px-[5vw] bg-black/40 backdrop-blur-xs flex items-center justify-center z-60`}
    >
      <section
        onClick={(e) => e.stopPropagation()}
        className="bg-white max-h-full w-sm py-4 rounded-lg flex flex-col gap-6 shadow-2xl overflow-hidden 
        relative text-(--textColor) text-[15px] md:text-xl"
      >
        <div className="flex items-center justify-between px-6">
          <h2 className="text-[15px] font-medium tracking-wider">
            Product Options
          </h2>
          <button
            onClick={onClose}
            className=" w-8 h-8 border-2 border-(--accent)/30 rounded-full flex items-center justify-center 
            cursor-pointer scale-95 hover:scale-100 transition-transform duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 w-full px-4 pb-4">
          {/* Product Image */}
          <div className={`w-full aspect-5/7 rounded-lg`}>
            <img
              // src={`${BASE_URL}${product.images[0]}`}
              src={
                product.images[0]?.startsWith("http")
                  ? product.images[0]
                  : `${BASE_URL}${product.images[0]}`
              }
              alt={product.productName}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          <div className="space-y-3">
            {/* Product Name */}
            <p className="">{product.productName}</p>

            {/* Product Price */}
            <p>{formatPrice(selectedLength?.price || product.price)}</p>
          </div>

          {/* Color */}
          <ColorSelector
            colors={product.availableColors}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />

          {/* Lenthg (inches) */}
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-semibold">Length</span>

            <select
              value={selectedLength?.size}
              onChange={(e) => {
                const selectedSize = e.target.value;
                const found = product.lengths.find(
                  (l) => String(l.size) === String(selectedSize),
                );
                if (found) setSelectedLength(found);
              }}
              className="outline-none border-2 border-(--accent)/20 rounded-lg p-2"
            >
              {product.lengths?.map((len, index) => {
                const isOutOfStock = len.inventory <= 0;

                return (
                  <option key={index} value={len.size} disabled={isOutOfStock}>
                    {len.size}" inch - {formatPrice(len.price)}{" "}
                    {isOutOfStock ? "(Out of Stock)" : ""}
                  </option>
                );
              })}
            </select>
          </label>

          {/* Quantity */}
          <QuantitySelector
            count={quantity}
            onChange={(val) => setQuantity(val)}
            max={selectedLength?.inventory || 0}
          />

          <div className="space-y-2 text-sm">
            <button
              onClick={handleAddToCart}
              disabled={loading || quantity < 1}
              className={`w-full text-center border-2 border-(--accent)/20 py-2 px-6 rounded-lg scale-99 
              hover:scale-100 transition-all duration-200 cursor-pointer ${
                loading || quantity < 1 ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              {selectedLength?.inventory <= 0
                ? "Out of Stock"
                : loading
                  ? "Adding..."
                  : "Add to cart"}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={loading || quantity < 1}
              className="w-full text-center py-2 px-6 bg-(--accent) rounded-lg text-white scale-99 
              hover:scale-100 transition-all duration-200 cursor-pointer"
            >
              {loading ? "Processing..." : "Buy now"}
            </button>
          </div>

          <Link href={`/shop/${product.slug}`} className="group">
            <span className="flex items-center gap-2 text-sm group-hover:underline underline-offset-2">
              View full details{" "}
              <MoveRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-100" />
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
