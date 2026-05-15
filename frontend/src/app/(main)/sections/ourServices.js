"use client";
import { Playfair_Display, Inter } from "next/font/google";
import services from "../data-sources/services";

const playfair = Playfair_Display({
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
});

export default function OurServices() {
  return (
    <section className="py-20 px-10 space-y-6">
      <div className="space-y-4">
        <h2
          className={`${playfair.className} text-4xl md:text-5xl text-(--textColor) font-semibold text-center tracking-wider`}
        >
          Our Services
        </h2>
        <p
          className={`${inter.className} text-lg md:text-xl text-(--textColor) font-medium text-center`}
        >
          Thoughtfully crafted hair solutions designed to express your
          individuality.
        </p>
      </div>

      <ul className="py-10 max-w-300 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <li
            key={index}
            className={` ${inter.className} bg-(--lightSilver) py-6 px-4 rounded-lg grid grid-cols-[50px_1fr] gap-x-6`}
          >
            <span className="h-12 w-12 bg-(--accent)/50 text-(--textColor) rounded-full flex items-center justify-center">
              {service.icon}
            </span>
            <h3 className="font-medium text-lg  self-center">{service.name}</h3>
            <p className="col-start-2">{service.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
