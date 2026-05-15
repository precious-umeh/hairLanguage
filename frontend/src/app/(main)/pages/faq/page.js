"use client";

import AccordionItem from "@/app/(main)/components/accordion";
import Newsletter from "@/app/(main)/sections/newsletter";
import faqs from "@/app/(main)/data-sources/faqs";
import { Playfair_Display, Inter } from "next/font/google";
import { useState } from "react";
import { motion } from "framer-motion";

const playfair = Playfair_Display({
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
});

const slideUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section
      className={`pt-15 px-10 ${inter.className} font-medium text-(--textColor)`}
    >
      <main>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideUpVariant}
          className="space-y-10"
        >
          <h2
            className={`${playfair.className} text-3xl md:text-4xl lg:text-5xl font-semibold text-center tracking-wider`}
          >
            Frequently Asked Questions
          </h2>

          <div className="max-w-200 mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                faq={faq}
                isOpen={openIndex === index}
                onToggle={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              />
            ))}
          </div>
        </motion.div>
      </main>

      <Newsletter />
    </section>
  );
}
