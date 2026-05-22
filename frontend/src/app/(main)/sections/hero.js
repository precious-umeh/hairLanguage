"use client";

import { Playfair_Display, Inter } from "next/font/google";
import { motion } from "framer-motion";

const playfair = Playfair_Display({
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
});

const containerVariant = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.4,
      delayChildren: 0.1,
    },
  },
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const buttonVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HeroSection() {
  return (
    <section className="w-full h-[calc(100vh-76px)] bg-[url(/images/hlHeroMob.png)] md:bg-[url(/images/hlHeroDes.png)] bg-cover  overflow-hidden">
      <div className="w-full h-full bg-black/35 text-center flex flex-col items-center justify-center p-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariant}
          className="mt-25 space-y-8"
        >
          <motion.div variants={fadeUpVariant}>
            <div className="">
              <h1
                className={`${playfair.className} text-4xl md:text-5xl lg:text-7xl text-(--softAsh) font-bold`}
              >
                Hair is a Language. Speak Yours
              </h1>
              <h2
                className={`${inter.className} text-md md:text-xl lg:text-3xl text-(--softAsh) font-semibold mt-6 
                text-shadow-2xs`}
              >
                Every style tells a story - choose the one that feels like you.
              </h2>
            </div>
          </motion.div>

          <motion.button
            variants={buttonVariant}
            className="bg-(--softAsh) px-4 py-2 rounded-lg text-(--text-color) font-medium capitalize cursor-pointer 
            scale-95 hover:scale-100 transition-transform duration-200"
          >
            <a href="/shop">Shop the collection</a>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
