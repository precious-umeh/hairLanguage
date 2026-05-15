"use client";

import { Playfair_Display, Inter } from "next/font/google";
import { motion } from "framer-motion";

const playfair = Playfair_Display({
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
});

const fadeInVariant = {
  hidden: { opacity: 0, x: -80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function OurStory() {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeInVariant}
      className={`${inter.className} pb-16 md:px-16 md:pb-24 lg:px-0`}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2">
        <div className="self-center px-8 md:px-10 space-y-8 py-12 max-w-2xl mx-auto lg:mx-0 lg:max-w-none">
          <div className="space-y-4">
            <h2
              className={`${playfair.className} text-3xl md:text-4xl lg:text-5xl font-medium tracking-wider`}
            >
              The Hair Language Story
            </h2>
            <div>
              <h3 className="text-lg md:text-xl">By Francisca Ngozi</h3>
              <span className="italic">Since 2018</span>
            </div>
          </div>

          <article className="space-y-4">
            <p>
              Hair Language began with a simple but powerful realization during
              Francisca's university days — hair is more than beauty, it is
              identity.
            </p>

            <p>
              While balancing lectures, assignments, and campus life, she
              noticed how deeply confidence and self-expression were tied to
              hair. Friends constantly asked for recommendations, styling tips,
              and product advice. What started as casual conversations in
              hostels and between classes slowly grew into something bigger — a
              vision to create a brand that truly understands the language of
              hair.
            </p>

            <p>
              Frustrated by the lack of reliable, quality options that catered
              to Nigerian women's diverse textures and lifestyles, she decided
              to build what she wished existed. What began as a passion project
              — sourcing quality products, learning the science behind hair
              care, and serving a small but loyal community — soon evolved into
              something far greater.
            </p>

            <p>
              From fulfilling orders personally to growing into a trusted
              Nigerian hair brand, the journey has been one of resilience,
              learning, and purpose. Every challenge refined the mission: to
              provide products that empower women to feel confident, expressive,
              and seen.
            </p>

            <p>
              Today, Hair Language continues to grow, but the heart remains the
              same — helping every woman speak her beauty fluently, through her
              hair.
            </p>
          </article>
        </div>

        <div className="aspect-square w-full lg:aspect-auto lg:h-full">
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            src="/images/berry2.png"
            className="w-full h-full object-cover object-[center_20%]"
          />
        </div>

        <div className="aspect-square w-full lg:aspect-auto lg:h-full order-4 lg:order-0">
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            src="/images/berry.png"
            className="w-full h-full object-cover object-[center_20%]"
          />
        </div>

        <div className="self-center px-10 space-y-8 py-12 max-w-2xl mx-auto lg:mx-0 lg:max-w-none order-3 lg:order-0">
          <h2
            className={`${playfair.className} text-3xl md:text-4xl lg:text-5xl font-medium tracking-wider`}
          >
            The Future Of Hair Language
          </h2>

          <article className="space-y-4">
            <p>
              Looking ahead, Hair Language is building more than a product line
              — it is building a movement rooted in confidence, culture, and
              care. Our vision is to become one of Nigeria's most trusted hair
              brands, expanding into innovative treatments, educational content,
              and community-driven experiences that empower women to truly
              understand and embrace their hair.
            </p>

            <p>
              As we grow, we remain committed to quality, authenticity, and
              creating products tailored specifically for the unique needs of
              African hair — not just following trends, but setting them.
            </p>
          </article>
        </div>
      </div>
    </motion.section>
  );
}
