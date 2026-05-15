"use client";

import { Inter } from "next/font/google";
import { Handbag, CircleUser } from "lucide-react";
import { usePathname } from "next/navigation";
import { isActive } from "../utils/navigation.js";
import Link from "next/link";
import navLinks from "../data-sources/navLinks.js";
import MobileNav from "./mobileNav.js";
import { useCart } from "@/providers/public/cart-provider.js";

const inter = Inter({
  subsets: ["latin"],
});

export default function Navbar() {
  const pathname = usePathname();
  const { openCart, cartData } = useCart();

  return (
    <nav className={`${inter.className} fixed top-0 left-0 w-full z-50`}>
      <div className="py-2 px-10 md:px-15 bg-(--lightSilver) text-(--textColor) flex justify-between items-center">
        {/* Mobile Nav */}
        <MobileNav />

        <Link href="/">
          <img src="/images/hairLanguageLogo/logo-black.png" className="w-30" />
        </Link>

        <ul className="hidden lg:flex gap-8 font-semibold -ml-10">
          {navLinks.map((link, id) => {
            const linkActive = isActive(link, pathname);

            return (
              <li key={id} className="">
                <Link
                  href={link.path}
                  className={`nav-underline ${linkActive ? "active" : ""}`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex gap-6 items-center">
          <Link href="/login" className="hidden md:block">
            <CircleUser className="h-7 w-7 scale-95 hover:scale-100 transition-all duration-200 hover:text-(--accent)" />
          </Link>

          <button onClick={openCart} className="relative">
            <Handbag className="h-7 w-7 scale-95 hover:scale-100 transition-all duration-200 hover:text-(--accent)" />

            {cartData.totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-(--headingPrimary) text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartData.totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
