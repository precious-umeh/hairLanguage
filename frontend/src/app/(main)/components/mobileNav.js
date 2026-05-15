"use client";

import { Inter } from "next/font/google";
import { CircleUser, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import navLinks from "../data-sources/navLinks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive } from "../utils/navigation";

const inter = Inter({
  subsets: ["latin"],
});

export default function MobileNav() {
  const [showMobileNav, setShowMobileNav] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = showMobileNav ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showMobileNav]);

  const closeNav = function () {
    setShowMobileNav(false);
  };

  // close nav when a path is clicked
  useEffect(() => {
    closeNav();
  }, [pathname]);

  return (
    <main className={`lg:hidden ${inter.className} text-(--textColor)`}>
      <nav>
        {/* Display MobileNav Icons */}
        {showMobileNav ? (
          <button
            onClick={closeNav}
            className="lg:hidden cursor-pointer flex items-center justify-center"
          >
            <X className="h-7 w-7 scale-95 hover:scale-100 transition-all duration-200" />
          </button>
        ) : (
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="lg:hidden cursor-pointer flex items-center justify-center"
          >
            <Menu className="h-7 w-7 scale-95 hover:scale-100 transition-all duration-200" />
          </button>
        )}

        <div
          onClick={closeNav}
          className={`lg:hidden fixed left-0 top-18.5 w-full bg-(--softCharcoal)/70 z-10 cursor-pointer transform
             transition-transform duration-300 ease-in-out ${showMobileNav ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-(--lightSilver) w-full md:w-[35vw] h-[calc(100dvh-74px)] flex flex-col relative"
          >
            <ul className="mt-10 space-y-1 flex-1 overflow-y-auto">
              {navLinks.map((link, index) => {
                const active = isActive(link, pathname);

                return (
                  <li
                    key={index}
                    className={`text-lg font-semibold transition-colors duration-300 ${
                      active ? "bg-(--softAsh)" : "md:hover:bg-(--coolGrey)"
                    }`}
                  >
                    <Link href={link.path} className="block py-3 px-8">
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="bg-(--softAsh) h-35 p-8 flex flex-col justify-between">
              <Link href={"/login"} className="md:hidden">
                <button className="md:hidden group flex items-center gap-4 text-md font-medium cursor-pointer">
                  <CircleUser className="h-7 w-7 scale-95 group-hover:scale-100 transition-transform duration-300" />
                  <span>Log in</span>
                </button>
              </Link>

              <div className="flex items-center gap-6">
                <Link href={"#"}>
                  <img
                    src="/icons/icons8-facebook-logo-90.png"
                    className="w-6 h-6"
                  />
                </Link>
                <Link href={"#"}>
                  <img
                    src="/icons/icons8-instagram-logo-90.png"
                    className="w-6 h-6"
                  />
                </Link>
                <Link href={"#"}>
                  <img
                    src="/icons/icons8-whatsapp-logo-90.png"
                    className="w-6 h-6"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </main>
  );
}
