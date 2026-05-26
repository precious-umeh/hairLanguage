"use client";

import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  MoveRight,
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  Sparkles,
} from "lucide-react";
import { useStoreSettings } from "@/providers/public/store-settings";

const inter = Inter({
  subsets: ["latin"],
});

export default function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();

  const { storeSettings } = useStoreSettings();

  const socials = storeSettings?.socials || {};

  // Decide final urls
  const instagramUrl = socials.instagram || "#";
  const facebookUrl = socials.facebook || "#";
  const tiktokUrl = socials.tiktok || "#";
  const whatsappUrl = socials.whatsapp || "#";

  const address =
    storeSettings?.storeAddress ||
    "Shop A22 Rossy Mall, Lekky County Homes, Ikota Lekki, Lagos.";
  const phone = storeSettings?.businessPhone || "+234 816 961 4621";
  const email = storeSettings?.supportEmail || "info@hairlanguage.com";
  const openingHours = storeSettings?.openingHours || "";

  return (
    <footer
      className={`bg-(--lightSilver) ${inter.className} text-(--textColor) font-medium text-[13px] md:text-[14px] border-t border-(--coolGrey)`}
    >
      {/* Value Propositions / Trust Badges Strip */}
      <div className="border-b border-(--coolGrey) py-8 px-[5vw]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex flex-col items-center sm:flex-row gap-3">
            <div className="p-2 bg-white rounded-full shadow-sm text-(--accent)">
              <Sparkles size={18} />
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider">
                Premium Quality
              </h4>
              <p className="text-xs text-(--textMuted) mt-0.5">
                100% Raw Virgin extensions & custom luxury units.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center sm:flex-row gap-3">
            <div className="p-2 bg-white rounded-full shadow-sm text-(--accent)">
              <Truck size={18} />
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider">
                Reliable Dispatch
              </h4>
              <p className="text-xs text-(--textMuted) mt-0.5">
                Secure packaging and delivery nationwide.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center sm:flex-row gap-3">
            <div className="p-2 bg-white rounded-full shadow-sm text-(--accent)">
              <ShieldCheck size={18} />
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider">
                Secure Payment
              </h4>
              <p className="text-xs text-(--textMuted) mt-0.5">
                Cryptographic transactions handling powered by Paystack.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Pillars */}
      <div className="py-16 px-[5vw]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Pil 1 - Brand Intro */}

          {/* <div className="mt-[-15] ml-[-12] space-y-5 order-4 md:order-0"> */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-block">
              <img
                src="/images/hairLanguageLogo/logo-black.png"
                className="w-36"
              />
            </Link>

            <p className="text-(--textMuted) text-xs md:text-sm leading-relaxed max-w-sm">
              Premium hair tailored to match your personal statement. Discover
              luxury collections built to look flawless.
            </p>
          </div>

          {/* Pil 2 - Quick Shop Links */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider">
              Shop Collections
            </h3>

            <ul className="space-y-2.5 text-xs md:text-sm font-semibold text-(--textMuted)">
              <li>
                <Link
                  href="/shop?category=wigs"
                  className="hover:text-(--textColor) transition-colors"
                >
                  Luxury Custom Wigs
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=bundles"
                  className="hover:text-(--textColor) transition-colors"
                >
                  Raw Virgin Bundles
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=frontals"
                  className="hover:text-(--textColor) transition-colors"
                >
                  Lace Frontals
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=closures"
                  className="hover:text-(--textColor) transition-colors"
                >
                  Closures
                </Link>
              </li>
            </ul>
          </div>

          {/* Pil 3 - Support Links */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider">
              Customer Care
            </h3>

            <ul className="space-y-2.5 text-xs md:text-sm font-semibold text-(--textMuted)">
              <li>
                <Link
                  href="/pages/track-order"
                  className="hover:text-(--textColor) transition-colors"
                >
                  Track Order Status
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/contact"
                  className="hover:text-(--textColor) transition-colors"
                >
                  Get in Touch
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/faq"
                  className="hover:text-(--textColor) transition-colors"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/returns"
                  className="hover:text-(--textColor) transition-colors"
                >
                  Exhange Policies
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/consultation"
                  className="hover:text-(--textColor) transition-colors"
                >
                  Book a Consultation
                </Link>
              </li>
            </ul>
          </div>

          {/* Pil 4 - Showroom Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider">
              Contact Info
            </h3>

            <ul className="space-y-3 text-xs font-medium text-(--textMuted)">
              <li className="flex  items-start gap-2.5">
                <MapPin
                  size={16}
                  className="text-(--textMuted)/70 shrink-0 mt-0.5"
                />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="text-(--textMuted)/70 shrink-0" />
                <a
                  href={`tel:${phone}`}
                  className="hover:underline font-semibold font-mono text-(--textMuted)"
                >
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="text-(--textMuted)/70 shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="hover:underline font-semibold text-(--textMuted)"
                >
                  {email}
                </a>
              </li>
              <li className="flex items-center gap-2.5 border-t border-(--coolGrey) pt-2.5 mt-1">
                <Clock size={14} className="text-(--textMuted)/70 shrink-0" />
                <span>{openingHours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Baseline Strip */}
      <div className="border-t border-(--coolGrey) py-6 px-[5vw] bg-gray-50/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-(--textMuted) text-center sm:text-left">
            &copy; {year} Hair Language. All Rights Resevered.
          </p>

          {/* Social Icons Strip Group */}
          <div className="flex items-center gap-4">
            <Link
              href={facebookUrl}
              target={facebookUrl !== "#" ? "_blank" : undefined}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <img
                src="/icons/icons8-facebook-logo-90.png"
                alt="Facebook"
                className="w-5 h-5 object-contain"
              />
            </Link>
            <Link
              href={instagramUrl}
              target={instagramUrl !== "#" ? "_blank" : undefined}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <img
                src="/icons/icons8-instagram-logo-90.png"
                alt="Instagram"
                className="w-5 h-5 object-contain"
              />
            </Link>
            <Link
              href={whatsappUrl}
              target={whatsappUrl !== "#" ? "_blank" : undefined}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <img
                src="/icons/icons8-whatsapp-logo-90.png"
                alt="WhatsApp"
                className="w-5 h-5 object-contain"
              />
            </Link>
            <Link
              href={tiktokUrl}
              target={tiktokUrl !== "#" ? "_blank" : undefined}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <img
                src="/icons/icons8-tiktok-logo-90.png"
                alt="TikTok"
                className="w-5 h-5 object-contain"
              />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
