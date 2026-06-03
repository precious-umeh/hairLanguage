"use client";

import { Playfair_Display, Inter } from "next/font/google";
import Link from "next/link";

const playfair = Playfair_Display({
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
});

export default function HairConsultation() {
  return (
    <section
      className={`py-25 px-6 md:px-10 ${inter.className} text-(--textColor)`}
    >
      <div className="max-w-300 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-10">
        <img
          src="/images/different-looks.png"
          alt="Woman unsure of which hairstyle to choose"
          className="order-2 lg:order-1 w-full max-h-105 object-cover border-2 border-(--accent) rounded-lg shadow-2xl"
        />

        <div className="order-1 lg:order-2 self-center text-center lg:text-left lg:px-6 space-y-8">
          <div>
            <h3
              className={`uppercase ${playfair.className} font-semibold text-[12px] text-(--textMuted)`}
            >
              Not sure where to start?
            </h3>
            <h2
              className={`${playfair.className} capitalize text-3xl font-semibold`}
            >
              We help you speak your style fluently
            </h2>
          </div>

          <p className="max-w-lg mx-auto lg:mx-0">
            With so many textures, lengths, and styles, choosing the right hair
            can feel overwhelming. At Hair Language, we help you find hair that
            fits your face, lifestyle, and confidence — without the guesswork.
          </p>

          <Link href="/pages/consultation">
            <button
              className="inline-flex bg-(--accent) text-medium text-white rounded-md py-3 px-6 cursor-pointer scale-95 
               hover:scale-100 transition-all duration-300"
            >
              Book a Consultation
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
