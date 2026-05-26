"use client";

import { useEffect } from "react";
import Footer from "./components/footer";
import Navbar from "./components/navbar";
import { useAuth } from "@/providers/admin/auth-provider";
import { usePathname, useRouter } from "next/navigation";
import CartProvider from "@/providers/public/cart-provider";
import CartSidebar from "./components/productComponents/cartSidebar";
import {
  StoreSettingsProvider,
  useStoreSettings,
} from "@/providers/public/store-settings";

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
        <StoreSettingsProvider>
          <MainLayoutContent protectedRoute={protectedRoute}>
            {children}
          </MainLayoutContent>
        </StoreSettingsProvider>
      )}
    </CartProvider>
  );
}

function MainLayoutContent({ children, protectedRoute }) {
  const { user } = useAuth();
  const { storeSettings, loadingStoreSettings } = useStoreSettings();

  const maintenanceModeOn = storeSettings?.maintenanceMode === true;
  const isAdmin = !!user && user.role === "admin";
  const showMaintenance =
    maintenanceModeOn && !loadingStoreSettings && !isAdmin;

  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />

      <CartSidebar />
      <div className="pt-19 flex-1">
        {showMaintenance ? <MaintenancePage /> : children}
      </div>

      {protectedRoute ? null : <Footer />}
    </main>
  );
}

function MaintenancePage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] text-center px-6">
      <div className="space-y-4 max-w-md">
        <h1 className="text-2xl font-bold">We'll be right back!</h1>

        <p className="text-sm text-(--textMuted)">
          Our store is currently undergoing maintenance to improve your
          experience. Please check back soon.
        </p>
      </div>
    </div>
  );
}
