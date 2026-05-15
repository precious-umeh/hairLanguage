"use client";

import { Playfair_Display, Inter } from "next/font/google";
import { useState } from "react";
import server from "../../utils/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import { CircleCheckBig, Loader2 } from "lucide-react";

const playfair = Playfair_Display({
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
});

export default function ConsultationPage() {
  const initialFormState = {
    texture: [],
    occasion: [],
    name: "",
    contact: "",
    message: "",
  };
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await server.post("/api/consultations", formData);

      if (response.status === 201) {
        setConfirmationModal(true);
        setFormData(initialFormState);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Oops! Something went wrong. Please check your connection.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${inter.className} text-(--textColor) py-15 px-[5vw]`}>
      <Toaster position="top-left" />
      <div
        className="bg-(--softAsh) w-full h-full md:h-auto md:max-w-200 md:mx-auto p-10 
          rounded-xl md:rounded-2xl md:shadow-xl flex flex-col gap-8 overflow-y-auto relative"
      >
        <div className="text-center text-(--textColor) space-y-2">
          <h2
            className={`font-semibold text-3xl md:text-4xl ${playfair.className}`}
          >
            Book a Hair Consultation
          </h2>
          <h3 className="font-medium">
            Tell us a little bit about you, we'll guide you to the perfect hair.
          </h3>
        </div>

        <div className="mt-4 space-y-7">
          <div className="space-y-3">
            <h2 className="text-[16px] md:text-xl font-semibold">
              Which hair texture fits you?
            </h2>

            <div className="flex gap-4 flex-wrap">
              {["Straight", "Wavy", "Curly", "Not sure"].map((t) => {
                const isSelected = formData.texture.includes(t);

                const handleClick = () => {
                  isSelected &&
                    setFormData({
                      ...formData,
                      texture: formData.texture.filter((item) => item !== t),
                    });

                  !isSelected &&
                    setFormData({
                      ...formData,
                      texture: [...formData.texture, t],
                    });
                };

                return (
                  <button
                    key={t}
                    onClick={handleClick}
                    className={`rounded-md px-4 py-1.5 text-sm md:text-[16px] transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? "bg-(--accent) text-white scale-105"
                        : "bg-transparent text-(--textMuted) opacity-50 grayscale"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-[16px] md:text-xl font-semibold">
              Occassion / Use
            </h2>
            <div className="flex gap-6 flex-wrap">
              {[
                "Everyday wear",
                "Special event",
                "First-time buyer",
                "Replacement / upgrade",
              ].map((o) => {
                const isSelected = formData.occasion.includes(o);

                const handleClick = () => {
                  isSelected &&
                    setFormData({
                      ...formData,
                      occasion: formData.occasion.filter((item) => item !== o),
                    });

                  !isSelected &&
                    setFormData({
                      ...formData,
                      occasion: [...formData.occasion, o],
                    });
                };

                return (
                  <button
                    key={o}
                    onClick={handleClick}
                    className={`rounded-md px-4 py-1.5 text-sm md:text-[16px] transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? "bg-(--accent) text-white scale-105"
                        : "bg-transparent text-(--textMuted) opacity-50 grayscale"
                    }`}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
            <h2 className="text-[16px] md:text-xl font-semibold">
              Your details
            </h2>
            <input
              type="text"
              placeholder="Your name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border border-(--textMuted) p-2 rounded-md w-full placeholder:text-sm"
              required
            />
            <input
              type="text"
              placeholder="Email or WhatsApp"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="border border-(--textMuted) p-2 rounded-md w-full placeholder:text-sm"
              required
            />
            <textarea
              rows={3}
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Describe the style you're envisioning..."
              className="border border-(--textMuted) p-3 rounded-md w-full resize-none text-sm placeholder:text-sm"
            ></textarea>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`py-2 px-4 bg-(--accent) text-sm md:text-[16px] text-white rounded-md transition  ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer md:hover:shadow-md md:hover:scale-102 active:scale-95"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Loader2 size={18} className="animate-spin" /> Sending...
                </div>
              ) : (
                "Submit"
              )}
            </button>
          </form>
        </div>

        {/* Modal Confirmation Message */}
        {confirmationModal && (
          <div className="absolute inset-0 bg-inherit flex flex-col items-center justify-center gap-8">
            <div className="space-y-2">
              <CircleCheckBig size={50} className="text-(--accent) mx-auto" />
              <p className="font-medium text-lg">
                Our hair expert will reach out to you within 24hours
              </p>
            </div>

            <button
              onClick={() => {
                setConfirmationModal(false);
              }}
              className="bg-(--accent) text-white px-6 py-2 rounded-lg scale-95 hover:scale-100 
                  cursor-pointer transition duration-300"
            >
              Ok!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
