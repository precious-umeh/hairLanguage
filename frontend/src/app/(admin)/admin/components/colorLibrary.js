"use client";

import server from "@/app/(main)/utils/axiosClient";
import { Plus, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import DeleteModal from "./deleteModal";
import toast, { Toaster } from "react-hot-toast";
import { useProducts } from "@/providers/admin/product-provider";

export default function ColorLibrary() {
  const [formData, setFormData] = useState({ name: "", hex: "#000000" });
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    colors,
    setColors,
    fetchColor,
    setShowColorLibrary,
    toggleColorSelection,
    selectedColorIds,
  } = useProducts();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddColor = async () => {
    if (!formData.name) return;

    try {
      const response = await server.post("/api/colors", formData);

      const newColor = response.data?.data;

      if (newColor) {
        setColors([newColor, ...colors]);
        setFormData({ name: "", hex: "#000000" });
      }
    } catch (error) {
      console.error("Error adding color: ", error.message);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      await server.delete(`/api/colors/${itemToDelete._id}`);

      toast.success("Color deleted successfully");
      setColors(colors.filter((color) => color._id !== itemToDelete._id));
      setItemToDelete(null);
    } catch (error) {
      toast.error("Failed to delete color");
      console.error("Error deleting color: ", error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-(--textColor)/20 backdrop-blur-sm flex items-center justify-center">
      <Toaster position="top-left" />
      <div className="bg-white p-6 w-full max-w-lg rounded-2xl shadow-2xl ">
        <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-6">
          <div className="flex justify-between items-center ">
            <h3 className="font-bold text-lg text(--headingPrimary)">
              Color Library
            </h3>
            <button
              type="button"
              onClick={() => setShowColorLibrary(false)}
              className="w-10 h-10 bg-red-50 text-red-600 flex items-center justify-center rounded-full group"
            >
              <X
                size={22}
                className="group-hover:scale-110 transition-transform"
              />
            </button>
          </div>

          <div className="space-y-4  sticky top-0 bg-white z-10 pb-2">
            <div className="space-y-2 w-full">
              <label className="inline-block text-(--textMuted) text-sm font-semibold">
                Color Name
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border-2 border-(--lightSilver) rounded-xl text-(--textColor) 
                  outline-none focus:border-(--textMuted)"
                />

                <input
                  type="color"
                  name="hex"
                  value={formData.hex}
                  onChange={handleChange}
                  className="w-10 h-10 rounded-xl border-none bg-transparent cursor-pointer"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddColor}
              className="w-full flex items-center justify-center gap-2 p-2 bg-(--textColor) 
            text-white rounded-xl hover:opacity-90"
            >
              <Plus size={20} /> Add new color
            </button>
          </div>

          {/* COLORS LIST */}
          {colors.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 pb-4">
              {colors.map((color) => (
                <div
                  key={color._id}
                  onClick={() => toggleColorSelection(color._id)}
                  className={`flex items-center justify-between p-2 rounded-xl border-2 transition-all 
                cursor-pointer ${
                  selectedColorIds.includes(color._id)
                    ? "border-(--accent) bg-(--accent)/5"
                    : "border-transparent bg-(--softAsh)"
                }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full border shadow-sm"
                      style={{ background: color.hex }}
                    />
                    <span className="text-sm font-medium truncate">
                      {color.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToDelete(color);
                    }}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center border-2 border-dashed border-(--lightSilver) rounded-2xl">
              <p className="text-sm text-(--textMuted) italic">
                Your library is empty. Add your first color above!
              </p>
            </div>
          )}

          {/* DELETE MODAL */}
          <DeleteModal
            isOpen={!!itemToDelete}
            onClose={() => setItemToDelete(null)}
            onConfirm={handleDelete}
            loading={isDeleting}
            title="Delete Color"
            description={
              itemToDelete
                ? `Are you sure you want to delete ${itemToDelete.name} (${itemToDelete.hex})?`
                : ""
            }
          />
        </div>
      </div>
    </div>
  );
}
