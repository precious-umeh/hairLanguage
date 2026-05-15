"use client";

import { useEffect } from "react";
import Footer from "./components/footer";
import Navbar from "./components/navbar";
import { useAuth } from "@/providers/admin/auth-provider";
import { usePathname, useRouter } from "next/navigation";
import CartProvider from "@/providers/public/cart-provider";
import CartSidebar from "./components/productComponents/cartSidebar";

export default function MainLayout({ children }) {
  const { loading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // If we are on a protected route and still loading,
  // we can choose to hide the children entirely.
  const protectedRoute = pathname === "/profile";
  const hideContent = protectedRoute && (loading || !isAuthenticated);

  useEffect(() => {
    if (protectedRoute && !loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [protectedRoute, loading, isAuthenticated, router]);

  return (
    <CartProvider>
      {hideContent ? null : (
        <main className="flex flex-col min-h-screen">
          <Navbar />

          <CartSidebar />
          <div className="pt-19 flex-1">{children}</div>
          {protectedRoute ? null : <Footer />}
        </main>
      )}
    </CartProvider>
  );
}
