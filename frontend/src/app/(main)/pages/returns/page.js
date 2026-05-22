"use client";

import { Inter } from "next/font/google";
import Link from "next/link";
import {
  ShieldAlert,
  RefreshCcw,
  FileText,
  Truck,
  HelpCircle,
  Mail,
  ArrowRight,
} from "lucide-react";

const inter = Inter({
  subsets: ["latin"],
});

export default function ReturnsPolicy() {
  return (
    <main
      className={`bg-white ${inter.className} text-(--textColor) min-h-screen py-16 px-[5vw] max-w-5xl mx-auto`}
    >
      {/* Header Summary Section */}
      <section className="text-center space-y-4 mb-16 animate-zoom-in">
        <span className="text-[11px] font-black uppercase tracking-widest bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
          Customer Care Registry
        </span>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          Exchange & Return Policies
        </h1>
        <p className="text-xs md:text-sm text-(--textMuted) max-w-xl mx-auto leading-relaxed">
          At Hair Language, our commitment to premium quality matches our strict
          hygiene safety guidelines. Please review our institutional terms
          regarding delivery changes.
        </p>
      </section>

      {/* Core Hygiene Warning Banner */}
      <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-5 md:p-6 mb-12 flex flex-col sm:flex-row gap-4 items-start">
        <div className="p-2.5 bg-amber-500 text-white rounded-xl shrink-0">
          <ShieldAlert size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-amber-900 uppercase tracking-wide">
            Public Health & Hygiene Declaration
          </h4>
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            Due to the raw natural status and strict sanitary guidelines
            governing human hair products, hair extensions, frontals, closures,
            and custom wig units are classified as highly sensitive assets. **We
            cannot accept returns or exchanges if the bundle bindings, ties,
            lace nets, or security tags have been unraveled, cut, washed, or
            modified in any capacity.**
          </p>
        </div>
      </div>

      {/* Main Structural Matrix Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Core Pillar 1 */}
        <div className="bg-gray-50/50 border border-gray-100 p-6 rounded-2xl space-y-4">
          <div className="p-2.5 bg-white text-(--textColor) rounded-xl inline-block shadow-sm">
            <RefreshCcw size={16} />
          </div>
          <h3 className="font-black text-sm uppercase tracking-wide text-gray-900">
            7-Day Window
          </h3>
          <p className="text-xs text-(--textMuted) leading-relaxed">
            Requests for eligible order corrections or exchanges must be logged
            in our support matrix within **7 business days** following confirmed
            package receipt.
          </p>
        </div>

        {/* Core Pillar 2 */}
        <div className="bg-gray-50/50 border border-gray-100 p-6 rounded-2xl space-y-4">
          <div className="p-2.5 bg-white text-(--textColor) rounded-xl inline-block shadow-sm">
            <FileText size={16} />
          </div>
          <h3 className="font-black text-sm uppercase tracking-wide text-gray-900">
            Pristine Status
          </h3>
          <p className="text-xs text-(--textMuted) leading-relaxed">
            Items must stay directly in their original luxury container box.
            Hair components must not be shaken out, brushed, combed, split, or
            installed.
          </p>
        </div>

        {/* Core Pillar 3 */}
        <div className="bg-gray-50/50 border border-gray-100 p-6 rounded-2xl space-y-4">
          <div className="p-2.5 bg-white text-(--textColor) rounded-xl inline-block shadow-sm">
            <Truck size={16} />
          </div>
          <h3 className="font-black text-sm uppercase tracking-wide text-gray-900">
            Return Courier Logistics
          </h3>
          <p className="text-xs text-(--textMuted) leading-relaxed">
            Unless an item arrived damaged or an incorrect catalog option was
            shipped, customers bear the direct tracking courier delivery costs
            for returns.
          </p>
        </div>
      </div>

      {/* Detailed Technical Clauses Accordion Style */}
      <section className="space-y-6 mb-16">
        <h2 className="text-lg font-black tracking-tight border-b border-gray-100 pb-3 flex items-center gap-2">
          <HelpCircle size={16} className="text-(--accent)" /> Comprehensive
          Policy Clauses
        </h2>

        <div className="space-y-4 text-xs md:text-sm font-medium text-gray-700">
          <div className="space-y-1.5">
            <h4 className="font-bold text-gray-950">
              1. Custom Made-to-Order Wig Units
            </h4>
            <p className="text-(--textMuted) text-xs leading-relaxed">
              All bespoke wigs constructed tailored to custom measurements or
              specified styling requests are final. Adjustments can be managed
              via consultation, but direct cash or gateway refunds are strictly
              unavailable for individual custom tailoring parameters.
            </p>
          </div>

          <div className="space-y-1.5 pt-4 border-t border-gray-50">
            <h4 className="font-bold text-gray-950">
              2. Examination & Settlement Procedure
            </h4>
            <p className="text-(--textMuted) text-xs leading-relaxed">
              Once an item returns to our Lekki showroom, our evaluation desk
              examines the cuticle integrity, lace bindings, and factory labels.
              If cleared, store credits or product exchange vouchers are issued
              within 3-5 operating ledger days. Original shipping rates are
              non-refundable.
            </p>
          </div>

          <div className="space-y-1.5 pt-4 border-t border-gray-50">
            <h4 className="font-bold text-gray-950">
              3. Sale Items and Clearance Adjustments
            </h4>
            <p className="text-(--textMuted) text-xs leading-relaxed">
              Only standard factory listings qualify for store tracking
              exchanges. Items procured using flash seasonal discounts,
              clearouts, promotional prize vouchers, or custom price exemptions
              are strictly final sale items.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Support Navigation Footer block */}
      <section className="bg-gray-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="font-black text-base uppercase tracking-wide flex items-center justify-center md:justify-start gap-2">
            <Mail size={16} className="text-white opacity-80" /> Need to
            initiate an exchange?
          </h3>
          <p className="text-xs text-gray-400 max-w-md">
            Forward your unique Order Confirmation String and raw photos of the
            untampered packaging to our operations desk.
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <a
            href="mailto:hairlanguage@gmail.com"
            className="w-full sm:w-auto text-center px-5 py-3 bg-white text-gray-900 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
          >
            Email Support Registry
          </a>
          <Link
            href="/pages/contact"
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-bold px-5 py-3 border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Contact Form <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </main>
  );
}
