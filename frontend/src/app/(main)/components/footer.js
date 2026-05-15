"use client";

import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MoveRight } from "lucide-react";

const inter = Inter({
  subsets: ["latin"],
});

export default function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();

  return (
    <footer
      className={`bg-(--lightSilver) ${inter.className} text-(--textColor) font-medium text-[13px] md:text-[15px]`}
    >
      <div className="py-15 px-[5vw]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-6">
          <div className="mt-[-15] ml-[-12] space-y-5 order-4 md:order-0">
            <Link href="/">
              <img
                src="/images/hairLanguageLogo/logo-black.png"
                className="w-40"
              />
            </Link>

            <div className="pl-5 flex items-center gap-6">
              <Link href="#">
                <img
                  src="/icons/icons8-facebook-logo-90.png"
                  className="w-6 h-6"
                />
              </Link>
              <Link href="#">
                <img
                  src="/icons/icons8-instagram-logo-90.png"
                  className="w-6 h-6"
                />
              </Link>
              <Link href="#">
                <img
                  src="/icons/icons8-whatsapp-logo-90.png"
                  className="w-6 h-6"
                />
              </Link>
            </div>
          </div>

          <div className="space-y-3 md:space-y-5">
            <h3 className="font-semibold text-[18px] md:text-[20px] tracking-wider">
              Contact
            </h3>

            <div className="space-y-4">
              <p className="w-[85%]">
                Have a question about our products, your order, or just want to
                say hi?{" "}
                <Link
                  href="/pages/contact"
                  className={`${pathname === "/pages/contact" ? "underline underline-offset-4" : "flex items-center gap-1"}`}
                >
                  Contact Us
                  <MoveRight
                    className={`w-4 h-4 ${pathname === "/pages/contact" ? "hidden" : "block"}`}
                  />
                </Link>
              </p>

              <Link href="/" className="underline underline-offset-4 block">
                Phone: &nbsp; +234 816 961 4621
              </Link>

              <Link href="/" className="underline underline-offset-4 block">
                Email: &nbsp; hairlanguage@gmail.com
              </Link>
            </div>
          </div>

          <div className="space-y-3 md:space-y-5">
            <h3 className="font-semibold text-[18px] md:text-[20px] tracking-wider">
              Address
            </h3>

            <p className="w-[85%]">
              Shop A22 Rossy Mall, Lekky County Homes, Ikota Lekki, Lagos.
            </p>
          </div>

          <div className="space-y-3 md:space-y-5">
            <h3 className="font-semibold text-[18px] md:text-[20px] tracking-wider">
              Opening Hours
            </h3>

            <p className="">Mon - Sat: &nbsp; 9am &mdash; 7pm</p>
          </div>
        </div>
      </div>

      <div className="border-t border-(--accent)/50 text-center text-[10px] py-10">
        <p className="uppercase">
          &copy; {year} Hair Language. All Rights Resevered.
        </p>
      </div>
    </footer>
  );
}
