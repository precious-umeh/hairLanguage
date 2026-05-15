"use client";

import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import ProductGallery from "../../components/productComponents/productGallery";
import { formatPrice } from "../../utils/formatPrice";
import ColorSelector from "../../components/productComponents/colorSelector";
import QuantitySelector from "../../components/productComponents/quantitySelector";
import { useCart } from "@/providers/public/cart-provider";
import { useRouter } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
});

export default function ProductDetailsPage({ product }) {
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

      // Immediately go to checkout
      router.push("/pages/checkout");
    } catch (error) {
      console.error("Buy Now Error:", error);
    }
  };

  return (
    <main
      className={`px-[5vw] pt-15 ${inter.className} text-(--textColor) font-semibold`}
    >
      <div className="w-full grid grid-cols-1 [@media(min-width:700px)]:grid-cols-2 gap-10">
        <div className="min-w-0">
          <ProductGallery
            images={product.images}
            productName={product.productName}
          />
        </div>

        {/* Product Details */}
        <div className="w-full min-w-0 sticky top-24 h-fit space-y-6">
          <h2 className="text-2xl md:text-4xl ">{product.productName}</h2>

          <p className="text-2xl md:text-3xl">
            {formatPrice(selectedLength.price || product.price)}
          </p>

          <ColorSelector
            colors={product.availableColors}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />

          <label className="flex flex-col gap-2 text-sm">
            <span className="">Length</span>

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

          <QuantitySelector
            count={quantity}
            onChange={(val) => setQuantity(val)}
            max={selectedLength?.inventory || 0}
          />

          <div className="space-y-1 text-sm">
            <p className="">Description:</p>
            <p className="text-[15px] font-normal">{product.description}</p>
          </div>

          <div className="space-y-2 text-sm [@media(min-width:700px)]:text-xl">
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
        </div>
      </div>
    </main>
  );
}
