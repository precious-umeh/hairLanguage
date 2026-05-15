"use client";

import { MoveLeft, MoveRight } from "lucide-react";
import { Playfair_Display, Inter } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import testimonials from "../data-sources/testimonials";

const playfair = Playfair_Display({
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
});

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const sliderRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.4 },
    );

    if (sliderRef.current) {
      observer.observe(sliderRef.current);
    }

    return () => {
      if (sliderRef.current) {
        observer.unobserve(sliderRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === testimonials.length - 1 ? 0 : prev + 1,
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible, isPaused, testimonials.length]);

  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     if (e.key === "ArrowLeft") {
  //       console.log("Key pressed", e.key);
  //       setCurrentIndex((prev) =>
  //         prev === 0 ? testimonials.length - 1 : prev - 1,
  //       );
  //     }

  //     if (e.key === "ArrowRight") {
  //       console.log("Key pressed", e.key);
  //       setCurrentIndex((prev) =>
  //         prev === testimonials.length - 1 ? 0 : prev + 1,
  //       );
  //     }

  //     window.addEventListener("keydown", handleKeyDown);

  //     return () => {
  //       window.removeEventListener("keydown", handleKeyDown);
  //     };
  //   };
  // }, [testimonials.length]);

  return (
    <section className="px-10 py-20 space-y-15 bg-(--lightSilver)">
      <h2
        className={`${playfair.className} text-4xl md:text-5xl tracking-wider text-center font-semibold`}
      >
        What Our Customers Say
      </h2>

      {/* Slider */}
      <div
        ref={sliderRef}
        className="max-w-220 relative mx-auto overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={(e) => {
          setIsPaused(true);
          setTouchStartX(e.touches[0].clientX);
        }}
        onTouchMove={(e) => setTouchEndX(e.touches[0].clientX)}
        onTouchEnd={() => {
          setIsPaused(false);

          if (!touchStartX || !touchEndX) return;

          const distance = touchStartX - touchEndX;

          if (distance > 50) {
            // swipe left → next slide
            setCurrentIndex((prev) =>
              prev < testimonials.length - 1 ? prev + 1 : prev,
            );
          }

          if (distance < -50) {
            // swipe right → previous slide
            setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
          }

          setTouchStartX(null);
          setTouchEndX(null);
        }}
      >
        {/* Slider-track */}
        <div
          className="flex transition-transform duration-700"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {/* Slides */}
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="flex-none w-full py-10 md:px-25 flex items-center justify-center"
            >
              <div className="space-y-6">
                <p className="italic font-semibold text-lg">{t.title}</p>
                <p>{t.quote}</p>
                <span className="font-medium">&mdash; {t.author}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-3 my-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 w-2 rounded-full cursor-pointer transition-all duration-300 ${
                currentIndex === i
                  ? "bg-(--accent) scale-110"
                  : "bg-(--accent)/40"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Silder buttons */}
        <button
          // disabled={currentIndex === 0}
          onClick={() =>
            setCurrentIndex(
              (prev) => (prev > 0 ? prev - 1 : prev),
              // prev === 0 ? testimonials.length - 1 : prev - 1,
            )
          }
          className={`hidden md:flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 md:h-12 
            md:w-12 rounded-full transition-all duration-200  ${
              currentIndex === 0
                ? "bg-transparent"
                : "bg-(--accent)/50 cursor-pointer"
            }`}
        >
          <MoveLeft
            className={`h-5 w-5 md:w-6 md:h-6 ${currentIndex === 0 ? "hidden" : ""}`}
          />
        </button>
        <button
          // disabled={currentIndex === testimonials.length - 1}
          onClick={() =>
            setCurrentIndex(
              (prev) => (prev === testimonials.length - 1 ? prev : prev + 1),
              // prev === testimonials.length - 1 ? 0 : prev + 1,
            )
          }
          className={`hidden md:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 md:h-12 
            md:w-12 rounded-full transition-all duration-200 ${
              currentIndex === testimonials.length - 1
                ? "bg-transparent"
                : "bg-(--accent)/50 cursor-pointer"
            }`}
        >
          <MoveRight
            className={`h-5 w-5 md:w-6 md:h-6 ${currentIndex === testimonials.length - 1 ? "hidden" : ""}`}
          />
        </button>
      </div>
    </section>
  );
}
