"use client";

import { Loader2, Trash2 } from "lucide-react";

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-(--textColor)/40 
        backdrop-blur-sm"
    >
      <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div
            className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center 
              justify-center mx-auto"
          >
            <Trash2 size={24} />
          </div>
          <h3 className="text-lg font-bold text-(--textColor)">{title}</h3>
          <p className="text-sm text-(--textMuted)">{description}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 text-sm font-bold border border-(--lightSilver) rounded-xl 
              hover:bg-(--softAsh) transition-all disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 text-sm font-bold bg-red-500 text-white rounded-xl 
            hover:bg-red-600 transition-all shadow-md shadow-red-200 flex items-center 
              justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              "Yes, Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
