"use client";

import Newsletter from "@/app/(main)/sections/newsletter";
import { Playfair_Display, Inter } from "next/font/google";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import server from "../../utils/axiosClient";
import { Loader2 } from "lucide-react";

const playfair = Playfair_Display({
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
});

const slideLeftVariant = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeInOut",
    },
  },
};

export default function ContactUs() {
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = function (e) {
    const { name, value } = e.target;
    setContactData({ ...contactData, [name]: value });
  };

  const handleSubmit = async function (e) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await server.post("/api/contact", contactData);

      if (response.status === 201) {
        setContactData({ name: "", email: "", subject: "", message: "" });
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Oops! Something went wrong. Please check your connection.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className={`pt-15 px-10 ${inter.className} text-(--textColor) text-[14px] lg:text-[18px]`}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={slideLeftVariant}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="aspect-square w-full">
            <img
              src="/images/models2.png"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          <div className="w-[90%] text-center md:text-left">
            <h2
              className={`${playfair.className} text-3xl lg:text-5xl font-semibold tarcking-wider mb-6`}
            >
              Contact Us
            </h2>

            <p className="mb-4">
              For all customer service and general inquiries, kindly get in
              touch with us below. A member of our staff will reach out to you.
            </p>

            <p className="mb-3">
              <strong>Phone:</strong> Text or Call &nbsp; +234 816 961 4621
            </p>

            <p className="mb-3">
              <strong>Email:</strong> &nbsp;{" "}
              <Link href="/" className="underline underline-offset-5">
                hairlanguage@gmail.com
              </Link>
            </p>

            <p className="mb-3">
              <strong>Address:</strong> &nbsp; Shop A22 Rossy Mall, Lekky County
              Homes, Ikota Lekki, Lagos.
            </p>

            <p>
              <strong>Opening Hours:</strong> Mon - Sat: &nbsp; 9AM - 7PM
            </p>

            <p className="mt-4">
              Kindly wait 24hrs after a mail has been sent, for a response.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="my-15 max-w-200 mx-auto space-y-4 text-md"
        >
          <div className="w-full flex gap-4 md:gap-10 items-center">
            <input
              type="text"
              name="name"
              value={contactData.name}
              onChange={handleChange}
              placeholder="Name"
              required
              className="border-2 border-(--accent)/50 md:hover:border-(--accent) md:hover:shadow-md w-[50%] inline-block py-2 px-3 
              rounded-lg placeholder:text-[14px] outline-(--accent) transition-all duration-200"
            />
            <input
              type="email"
              name="email"
              value={contactData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="border-2 border-(--accent)/50 md:hover:border-(--accent) md:hover:shadow-md w-[50%] inline-block py-2 px-3 
            rounded-lg placeholder:text-[14px] outline-(--accent) transition-all duration-200"
            />
          </div>

          <input
            type="text"
            name="subject"
            value={contactData.subject}
            onChange={handleChange}
            placeholder="Subject"
            className="border-2 border-(--accent)/50 md:hover:border-(--accent) md:hover:shadow-md w-full inline-block py-2 px-3 
            rounded-lg placeholder:text-[14px] outline-(--accent) transition-all duration-200"
          />

          <textarea
            name="message"
            value={contactData.message}
            onChange={handleChange}
            placeholder="Message"
            rows={3}
            className="border-2 border-(--accent)/50 md:hover:border-(--accent) md:hover:shadow-md w-full inline-block py-2 px-3 
            rounded-lg placeholder:text-[14px] outline-(--accent) resize-none transition-all duration-200"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-(--accent) text-white rounded-lg font-medium  
            transition-all duration-200 ${
              isSubmitting
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer md:hover:shadow-md md:hover:scale-[1.02] active:scale-95"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Sending...
              </div>
            ) : (
              "Send message"
            )}
          </button>
        </form>

        <div className="">
          <div className="w-full h-80 md:h-100 lg:h-125 grayscale">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d783.7992225793438!2d3.557491528370095!3d6.437386931351702!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf78eda5db59f%3A0xdf0fddec4f3a323f!2sROSSY%20MALL%20-%20IKOTA!5e0!3m2!1sen!2sng!4v1771282088040!5m2!1sen!2sng"
              className="w-full h-full border-2 border-(--accent) rounded-lg"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        <Newsletter />
      </motion.div>
    </section>
  );
}
