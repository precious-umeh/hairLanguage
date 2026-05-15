"use client";

import { Loader2, MoveRight } from "lucide-react";
import { Playfair_Display, Inter } from "next/font/google";
import { useState } from "react";
import server from "../utils/axiosClient";
import toast, { Toaster } from "react-hot-toast";

const playfair = Playfair_Display({
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
});

export default function Newsletter() {
  const [formData, setFormData] = useState({ email: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) return;

    setLoading(true);

    try {
      const response = await server.post("/api/newsletter", formData);

      setFormData({ email: "" });

      toast.success("Welcome to the community");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Something went wrong. Kindly check your connection.";
      toast.error(`Oops! ${message}`);
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className={`px-[5vw] py-15 ${inter.className} text-(--textColor) font-medium`}
    >
      <Toaster position="top-left" />

      <div className="max-w-200 mx-auto text-center py-5 space-y-8">
        <h2
          className={`${playfair.className} text-3xl md:text-4xl lg:text-5xl font-semibold tracking-wider`}
        >
          Stay In Touch
        </h2>
        <p className="text-[15px] md:text-lg">
          Confidence starts with the right hair. Sign up and get expert tips,
          style guides, and be the first to access our latest collections.
        </p>

        <form onSubmit={handleSubmit} className=" relative inline-block">
          <div
            className="border-2 border-(--accent)/50 w-full lg:w-[25vw] rounded-lg px-3 flex items-center justify-between 
            hover:border-(--accent) hover:shadow-md transition-all duration-200"
          >
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              aria-label="Email Address"
              className="block w-full py-3 outline-none disabled:bg-transparent placeholder:text-sm"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer disabled:cursor-not-allowed opacity-100 disabled:opacity-50"
            >
              {loading ? (
                <Loader2
                  size={20}
                  className="animate-spin text-(--textMuted)"
                />
              ) : (
                <MoveRight className="text-(--textMuted) hover:translate-x-1 transition-transform" />
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
