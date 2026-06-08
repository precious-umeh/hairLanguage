"use client";

import { Loader2, Plus, Upload, X } from "lucide-react";
import ColorLibrary from "./colorLibrary";

import { useProducts } from "@/providers/admin/product-provider";

export default function AddProductModal() {
  const {
    setShowProductModal,
    closeModal,
    productForm,
    setProductForm,
    handleChange,
    categories,
    wigTypes,
    textures,
    lengthPresets,
    showcolorLibrary,
    setShowColorLibrary,
    selectedColorIds,
    setSelectedColorIds,
    colors,
    toggleColorSelection,
    toggleLengthSelection,
    handleLengthPriceChange,
    handleLengthInventoryChange,
    loading,
    images,
    setImages,
    useUrl,
    setUseUrl,
    setImageUrl,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    handleAddImageUrl,
    removeImage,
    editMode,
    handleFormSubmission,
  } = useProducts();

  console.log("Selected IDs:", selectedColorIds, "Available Colors:", colors);

  return (
    <div className="fixed inset-0 w-full h-full px-4 z-50 bg-(--textColor)/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white md:w-[50vw] rounded-2xl shadow-xl">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between py-4 px-6 border-b-2 border-(--lightSilver)">
          <h2 className="font-bold text-xl text-(--headingPrimary)">
            {editMode ? "Update Product" : "Add Product"}
          </h2>

          <button
            type="button"
            onClick={() => closeModal()}
            className="w-10 h-10 bg-red-50 text-red-600 flex items-center justify-center rounded-full group"
          >
            <X
              size={22}
              className="group-hover:scale-110 transition-transform"
            />
          </button>
        </div>

        {/* PRODUCT FORM */}
        <form
          onSubmit={handleFormSubmission}
          className="py-4 px-6 grid grid-cols-1"
        >
          <div className="grid grid-cols-1 gap-3 overflow-y-auto h-[70vh] py-4 pr-2">
            {/* PRODUCT NAME */}
            <div className="space-y-2">
              <label className="inline-block text-(--textMuted) text-sm font-semibold">
                Product Name
              </label>
              <input
                name="productName"
                value={productForm.productName}
                onChange={handleChange}
                required
                className="w-full p-2 border-2 border-(--lightSilver) rounded-xl text-(--textColor) 
                  outline-none focus:border-(--textMuted)"
              />
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-2">
              <label className="inline-block text-(--textMuted) text-sm font-semibold">
                Description
              </label>
              <textarea
                name="description"
                value={productForm.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border-2 border-(--lightSilver) rounded-xl text-(--textColor) 
                  outline-none focus:border-(--textMuted) resize-none"
              />
            </div>

            {/* PRICE/INVENTORY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-8">
              <div className="space-y-2 w-full">
                <label className="inline-block text-(--textMuted) text-sm font-semibold">
                  Price (₦)
                </label>
                <input
                  name="price"
                  value={productForm.price}
                  onChange={handleChange}
                  required
                  type="number"
                  className="w-full p-2 border-2 border-(--lightSilver) rounded-xl text-(--textColor) 
                  outline-none focus:border-(--textMuted)"
                />
              </div>

              <div className="space-y-2 w-full">
                <label className="inline-block text-(--textMuted) text-sm font-semibold">
                  Inventory (Stock)
                </label>
                <input
                  name="inventory"
                  value={productForm.inventory ?? ""} // If productForm.inventory is null/undefined, use ""
                  onChange={handleChange}
                  type="number"
                  className="w-full p-2 border-2 border-(--lightSilver) rounded-xl text-(--textColor) 
                  outline-none focus:border-(--textMuted)"
                />
              </div>
            </div>

            {/* CATEGORIES/WIGTYPES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-8">
              <div className="space-y-2 w-full">
                <label className="inline-block text-(--textMuted) font-semibold text-sm">
                  Category
                </label>
                <select
                  name="category"
                  value={productForm.category}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border-2 border-(--lightSilver) rounded-xl text-(--textColor) 
                  outline-none focus:border-(--textMuted) text-sm"
                >
                  <option value="">Select Category</option>
                  {categories.map((item) => (
                    <option
                      key={item}
                      value={item}
                      className="capitalize text-(--textMuted)"
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 w-full">
                <label className="inline-block text-(--textMuted) font-semibold text-sm">
                  Wig Type
                </label>
                <select
                  name="wigType"
                  value={productForm.wigType}
                  onChange={handleChange}
                  className="w-full p-2 border-2 border-(--lightSilver) rounded-xl text-(--textColor) 
                    outline-none focus:border-(--textMuted) text-sm"
                >
                  <option value="">Select Wig Type</option>
                  {wigTypes.map((item) => (
                    <option
                      key={item}
                      value={item}
                      className="text-(--textMuted) capitalize"
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TEXTURES */}
            <div className="space-y-2 w-full">
              <label className="inline-block text-(--textMuted) font-semibold text-sm">
                Texture
              </label>
              <select
                name="texture"
                value={productForm.texture}
                onChange={handleChange}
                className="w-full p-2 border-2 border-(--lightSilver) rounded-xl text-(--textColor) 
                    outline-none focus:border-(--textMuted) text-sm"
              >
                <option value="">Select hair texture</option>
                {textures.map((item) => (
                  <option
                    key={item}
                    value={item}
                    className="text-(--textMuted) capitalize"
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* LENGTHS */}
            <div className="space-y-2 w-full">
              <label className="inline-block text-(--textMuted) font-semibold text-sm">
                Lengths & Prices (Inches)
              </label>
              <div className="grid grid-cols-1 gap-4">
                {lengthPresets.map((len) => (
                  <div
                    key={len.label}
                    className="space-y-2 p-3 bg-(--softAsh) rounded-xl"
                  >
                    <span className="text-xs font-bold text-(--textMuted) capitalize">
                      {len.label}
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {len.range.map((inch) => {
                        // Check if this specific inch is selected
                        const selectedLength = productForm.lengths.find(
                          (l) => l.size === inch,
                        );

                        return (
                          <div key={inch} className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => toggleLengthSelection(inch)}
                              className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all ${
                                selectedLength
                                  ? "bg-(--textColor) text-white border-(--textColor)"
                                  : "bg-white text-(--textColor) border-(--lightSilver)"
                              }`}
                            >
                              {inch}"
                            </button>

                            {/* Show price input only if this length is selected */}
                            {selectedLength && (
                              <div className="flex flex-col gap-1 mt-1">
                                {/* Price Input */}
                                <div className="flex items-center border border-(--lightSilver) rounded-md bg-white px-1">
                                  <span className="text-[10px] text-(--textMuted)">
                                    ₦
                                  </span>
                                  <input
                                    type="number"
                                    placeholder="Price"
                                    value={selectedLength.price}
                                    onChange={(e) =>
                                      handleLengthPriceChange(
                                        inch,
                                        e.target.value,
                                      )
                                    }
                                    className="w-16 p-1 text-xs outline-none"
                                  />
                                </div>

                                {/* Inventory Input */}
                                <div className="flex items-center border border-(--lightSilver) rounded-md bg-white px-1">
                                  <span className="text-[10px] text-(--textMuted)">
                                    Qty
                                  </span>
                                  <input
                                    type="number"
                                    placeholder="Stock"
                                    value={
                                      selectedLength.inventory === 0
                                        ? ""
                                        : selectedLength.inventory
                                    }
                                    onChange={(e) =>
                                      handleLengthInventoryChange(
                                        inch,
                                        e.target.value,
                                      )
                                    }
                                    onFocus={(e) => {
                                      if (Number(e.target.value) === 0) {
                                        handleLengthInventoryChange(inch, "");
                                      }
                                    }}
                                    className="w-16 p-1 text-xs outline-none"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLOR SECTION */}
            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center">
                <label className="inline-block text-(--textMuted) font-semibold text-sm">
                  Available Colors
                </label>

                <button
                  type="button"
                  onClick={() => setShowColorLibrary(true)}
                  className="text-xs font-bold text-(--accent) hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Manage Library
                </button>
              </div>

              <div className="flex flex-wrap gap-2 p-3 border-2 border-dashed border-(--lightSilver) rounded-xl min-h-12.5">
                {selectedColorIds.length === 0 ? (
                  <p className="text-xs text-(--textMuted) italic self-center">
                    No colors selected
                  </p>
                ) : (
                  selectedColorIds.map((id) => {
                    const colorData = colors.find((col) => col._id === id);

                    if (!colorData) return null;
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-2 bg-white border border-(--lightSilver) pl-1 pr-3 py-1 rounded-full shadow-sm"
                      >
                        {/* COLOR DOT */}
                        <div
                          className="w-5 h-5 rounded-full border border-(--textColor)/10"
                          style={{ background: colorData.hex }}
                          title={`${colorData.name} (${colorData.hex})`}
                        />

                        {/* COLOR NAME */}
                        <span className="text-xs font-medium text-(--textColor) capitalize">
                          {colorData.name}
                        </span>

                        {/* QUICK REMOVE BUTTON */}
                        <button
                          type="button"
                          onClick={() => toggleColorSelection(id)}
                          className="ml-1 text-(--textMuted) hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {showcolorLibrary && <ColorLibrary />}
            </div>

            {/* IMAGE UPLOAD SECTION */}
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex justify-between items-center">
                <label className="inline-block text-(--textMuted) font-semibold text-sm">
                  Product Images
                </label>

                <button
                  type="button"
                  onClick={() => setUseUrl(!useUrl)}
                  className="text-xs text-(--textColor) hover:underline"
                >
                  {useUrl ? "Upload Local Files" : "Use External URL"}
                </button>
              </div>

              {!useUrl ? (
                // File DropZone
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed p-8 rounded-xl text-center transition-colors ${
                    isDragging
                      ? "border-(--textMuted) bg-(--lightSilver)"
                      : "border-(--lightSilver) bg-(--softAsh)/50"
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-(--textMuted)" />
                    <p className="text-sm text-(--textMuted)">
                      <span className="font-semibold text-(--headingPrimary)">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                  </label>
                </div>
              ) : (
                // URL input
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Enter Image URL"
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full p-2 border-2 border-(--lightSilver) rounded-xl text-(--textColor) 
                      outline-none focus:border-(--textMuted) placeholder:text-sm"
                  />

                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 rounded-xl bg-(--textColor) text-white text-sm font-semibold 
                      hover:bg-(--textColor)/90 transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}

              {/* IMAGE PREVIEWS */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="relative w-28 h-28 border rounded-lg overflow-hidden bg-(--softAsh) group 
                        shadow-sm"
                    >
                      <img
                        src={
                          img instanceof File ? URL.createObjectURL(img) : img
                        }
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-white/80 rounded-full p-0.5 text-red-500 
                          hover:bg-red-600 hover:text-white shadow-md transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* MODAL ACTIONS */}
          <div className="flex items-center gap-4 justify-end mt-6">
            <button
              type="button"
              onClick={() => closeModal()}
              className="px-6 py-2 rounded-xl bg-(--accent) text-white text-sm font-semibold 
                hover:bg-(--accent)/90 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-(--textColor) text-white text-sm font-semibold 
                hover:bg-(--textColor)/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin text-center" />
              ) : editMode ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

{
  /* <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
  {lengthPresets.map((len) => (
    <div key={len.label} className="space-y-2">
      <span className="text-xs font-bold text-(--textMuted) capitalize">
        {len.label}
      </span>
      <div className="flex flex-wrap gap-2">
        {len.range.map((inch) => (
          <button
            key={inch}
            type="button"
            onClick={() => toggleLengthSelection(inch)}
            className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all ${
              productForm.lengths.includes(inch)
                ? "bg-(--textColor) text-white border-(--textColor)"
                : "bg-white text-(--textColor) border-(--lightSilver)"
            }`}
          >
            {inch}
          </button>
        ))}
      </div>
    </div>
  ))}
</div>; */
}
