"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import server from "@/app/(main)/utils/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ShoppingBag,
  Home,
  Search,
} from "lucide-react";
import Link from "next/link";

export function VerifyPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [isGuest, setIsGuest] = useState(true); //Default to guest
  const reference = searchParams.get("reference");

  useEffect(() => {
    if (!reference) {
      router.push("/");
      return;
    }

    const verify = async () => {
      try {
        const res = await server.get(`/api/transactions/verify/${reference}`);

        if (res.data.success) {
          // Check if the transaction/order has a userId
          const hasAccount = !!res.data.data.metadata?.userId;
          setIsGuest(!hasAccount);

          setStatus("success");
          toast.success("Payment Successful!");
        }
      } catch (error) {
        setStatus("error");
        toast.error(
          error.response?.data?.message || "Payment verification failed.",
        );
      }
    };

    verify();
  }, [reference, router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6 py-20">
      {/* <Toaster position="top-left" /> */}

      {/* ----- VERIFYING STATE ----- */}
      {status === "verifying" && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 text-(--accent) animate-spin opacity-40" />
          <h2 className="text-2xl font-semibold text-(--textColor)">
            Verifying Payment...
          </h2>
          <p className="text-(--textMuted)">
            Please do not refresh the page or close your browser.
          </p>
        </div>
      )}

      {/* ----- SUCCESS STATE ----- */}
      {status === "success" && (
        <div className="max-w-md w-full animate-zoom-in">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle2 className="w-20 h-20 text-green-600" />
            </div>
          </div>

          <h1 className="text-4xl font-black text-(--textColor) mb-2">
            Order Confirmed!
          </h1>

          <p className="text-(--textMuted) mb-8">
            Thank you for your purchase. Your payment was successful and your
            order is being prepared for dispatch.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() =>
                router.push(isGuest ? "/pages/track-order" : "/profile")
              }
              className="w-full bg-(--textColor) text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              {isGuest ? (
                <>
                  <Search size={18} /> Track My Order
                </>
              ) : (
                <>
                  <ShoppingBag size={18} /> View My Orders
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 py-3 border border-(--lightSilver) rounded-xl text-sm font-semibold hover:bg-(--softAsh) transition-colors"
              >
                <Home size={16} /> Return Home
              </Link>

              <Link
                href="/shop"
                className="flex items-center justify-center gap-2 py-3 border border-(--lightSilver) rounded-xl text-sm font-semibold hover:bg-(--softAsh) transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ----- ERROR STATE ----- */}
      {status === "error" && (
        <div className="max-w-md w-full fade-up">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full">
              <XCircle className="w-20 h-20 text-red-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-(--textColor) mb-2">
            Verification Failed
          </h1>

          <p className="text-(--textMuted) mb-8">
            We couldn't confirm your transaction. If you have been debited,
            please wait a few minutes or contact our support team.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-(--accent) text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all"
            >
              Retry Verification
            </button>

            <Link
              href="/pages/checkout"
              className="py-3 text-(--textMuted) text-sm font-medium hover:text-(--textColor) transition-colors"
            >
              Back to Checkout
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

export default function VerifyPaymentPageWrapper() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-col items-center justify-center min-h-[80vh] text-center py-20 px-6">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-16 h-16 text-(--accent) animate-spin opacity-40" />
            <h2 className="text-2xl font-semibold text-(--textColor)">
              Loading payment secure gateway...
            </h2>
          </div>
        </main>
      }
    >
      <VerifyPaymentPage />
    </Suspense>
  );
}
