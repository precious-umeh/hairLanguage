"use client";

import Link from "next/link";
import { useState } from "react";
import ProductPopup from "./productPopUp";
import { formatPrice } from "../../utils/formatPrice";
import { BASE_URL } from "../../utils/axiosClient";

export default function ProductGrid({ products }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <main>
      <div
        className={`grid grid-cols-2 lg:grid-cols-4 gap-6 text-[13px] md:text-[15px]`}
      >
        {products.map((product) => {
          const firstImage = product.images[0];
          const secondImage = product.images[1];

          return (
            <div
              key={product._id}
              className="w-full space-y-4 group cursor-pointer"
            >
              <Link href={`/shop/${product.slug}`} className="block">
                <div className={`w-full aspect-5/7 rounded-lg relative`}>
                  <img
                    src={`${BASE_URL}${firstImage}`}
                    alt={product.productName}
                    className="w-full h-full object-cover rounded-lg"
                  />

                  {secondImage && (
                    <div
                      className={`absolute inset-0 bg-amber-50 rounded-lg scale-95 opacity-0 md:group-hover:scale-100 
                      md:group-hover:opacity-100 transition-all duration-300`}
                    >
                      <img
                        src={`${BASE_URL}${secondImage}`}
                        alt={product.productName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="md:group-hover:underline underline-offset-4 transition-all duration-300">
                    {product.productName}
                  </p>

                  {/* <p>₦{product.price.toLocaleString()}</p> */}
                  <p>
                    {" "}
                    {product.lengths?.length > 1 ? "From" : ""}{" "}
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>

              <button
                onClick={() => setSelectedProduct(product)}
                className="w-full bg-(--accent) text-white rounded-lg py-2 px-6 cursor-pointer md:scale-95 
                    md:hover:scale-100 transition-transform duration-300"
              >
                Choose Options
              </button>
            </div>
          );
        })}
      </div>

      {selectedProduct && (
        <ProductPopup
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </main>
  );
}
