"use client";

import { Edit, Plus, Trash2 } from "lucide-react";
import AddProductModal from "../components/addProductModal";
import { useProducts } from "@/providers/admin/product-provider";
import { formatPrice } from "@/app/(main)/utils/formatPrice";
import { useState } from "react";
import DeleteModal from "../components/deleteModal";
import { useAdminSearch } from "@/providers/admin/admin-search-provider";

export default function Products() {
  const [itemToDelete, setItemToDelete] = useState(null);
  const {
    showProductModal,
    setShowProductModal,
    products,
    edit,
    setEditMode,
    loading,
    deleteProduct,
    getTotalStock,
  } = useProducts();
  const { searchQuery } = useAdminSearch();

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    if (!normalizedQuery) return true;

    const haystack = [
      product.productName,
      product.description,
      product.category,
      product.wigType,
      product.texture,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await deleteProduct(itemToDelete._id);
      setItemToDelete(null);
    }
  };

  return (
    <main className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-(--textMuted) uppercase tracking-[0.2em]">
            Inventory Management
          </h2>
          <p className="text-xs text-(--textMuted) mt-1 font-medium">
            Track and manage your product catalog
          </p>
          <p className="text-xs text-(--textMuted) mt-1 font-medium">
            Showing {filteredProducts.length} total{" "}
            {filteredProducts.length === 1 ? "product" : "products"}
            {normalizedQuery ? ` matching "${searchQuery.trim()}` : ""}
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => {
              setEditMode(false);
              setShowProductModal(true);
            }}
            className="flex items-center justify-center gap-2 bg-(--textColor) font-semibold 
            text-white text-sm px-4 py-2 rounded-xl active:scale-95"
          >
            <Plus size={14} /> Add New Product
          </button>
        </div>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 gap-6 mt-10">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductItem
              key={product._id}
              product={product}
              onEdit={edit}
              onDelete={() => setItemToDelete(product)}
              getTotalStock={getTotalStock}
            />
          ))
        ) : (
          <div className="w-full bg-white shadow-sm border border-(--lightSilver) rounded-xl text-center py-16 text-(--textMuted) text-sm">
            <p>
              {normalizedQuery
                ? `No products found for "${searchQuery.trim()}".`
                : "No products yet."}
            </p>
          </div>
        )}
      </div>

      {showProductModal && <AddProductModal />}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={loading}
        title="Delect Product"
        description={`Are you sure you want to delete ${itemToDelete?.productName}?`}
      />
    </main>
  );
}

/**
 * ProductItem Component:
 * Renders a single product row with details and action buttons.
 */
function ProductItem({ product, onDelete, onEdit, getTotalStock }) {
  const firstImage = product.images?.[0]
    ? product.images[0].startsWith("http")
      ? product.images[0]
      : `http://127.0.0.1:5500${product.images[0]}`
    : "https://via.placeholder.com/150";

  const totalStock = getTotalStock(product);

  return (
    <div
      className="bg-white p-4 rounded-2xl shadow-sm border border-(--lightSilver) flex
        flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:shadow-md 
        transition-shadow group relative"
    >
      {/* Product Image Preview */}
      <div
        className="w-full h-48 sm:w-24 sm:h-24 rounded-xl overflow-hidden border 
          border-(--textMuted) bg-(--softAsh) shrink-0"
      >
        <img
          src={firstImage}
          alt="Preview"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0 w-full">
        <div className="flex items-center gap-3 mt-1">
          <h3 className="text-xl font-bold text-(--textColor) truncate max-w-50 sm:max-w-none">
            {product.productName}
          </h3>

          <span
            className="px-3 py-0.5 bg-(--lightSilver) text-(--textMuted) text-[10px] font-bold rounded-full
              uppercase tracking-wider"
          >
            {product.category}
          </span>
        </div>

        <p className="text-sm text-(--textMuted) line-clamp-2 sm:line-clamp-1 mt-1">
          {product.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-3 sm:mt-2">
          <div className="text-lg font-bold text-(--textColor)">
            {formatPrice(product.price)}
          </div>

          <div className="text-sm font-medium text-(--textMuted)">
            Stock:{" "}
            <span
              className={
                totalStock === 0
                  ? "text-red-500"
                  : totalStock <= 10
                    ? "text-orange-500"
                    : "text-green-500"
              }
            >
              {totalStock}{" "}
              <span className="hidden sm:inline">
                {totalStock === 1 ? "unit" : "units"}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="flex sm:flex-col gap-1 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 mt-2 
          sm:mt-0 justify-end"
      >
        <button
          onClick={() => onEdit(product)}
          className="flex-1 sm:flex-none p-2 sm:p-3 text-(--textMuted)/60 hover:text-(--textColor) 
            hover:bg-(--lightSilver) rounded-xl transition-all flex items-center justify-center gap-2"
          title="Edit Product"
        >
          <Edit size={20} />
          <span className="sm:hidden text-xs font-bold">Edit</span>
        </button>

        <button
          onClick={onDelete}
          className="flex-1 sm:flex-none p-2 sm:p-3 text-(--textMuted)/60 hover:text-red-600 
            hover:bg-red-50 rounded-xl transition-all flex items-center justify-center gap-2"
          title="Delete Product"
        >
          <Trash2 size={20} />
          <span className="sm:hidden text-xs font-bold">Delete</span>
        </button>
      </div>
    </div>
  );
}
