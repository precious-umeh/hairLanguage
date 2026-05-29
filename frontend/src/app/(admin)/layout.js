"use client";

import { Inter } from "next/font/google";
import Sidebar from "./admin/components/sidebar";
import Topbar from "./admin/components/topbar";
import { NotificationProvider } from "@/providers/admin/notification-provider";
import { ProductProvider } from "@/providers/admin/product-provider";
import AdminMobNav from "./admin/components/mobileNav";
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/admin/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { AdminSearchProvider } from "@/providers/admin/admin-search-provider";

const inter = Inter({
  subsets: ["latin"],
});

export default function AdminLayout({ children }) {
  const [isMobNavOpen, setIsMobNavOpen] = useState(false);
  const { isAdmin, loading, user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // useEffect(() => {
  //   if (loading) return;

  //   const isLoginPage = pathname === "/admin/login";

  //   if (pathname === "/admin") {
  //     router.replace("/");
  //     return;
  //   }

  //   if ((!user || !isAdmin) && !isLoginPage) {
  //     router.replace("/");
  //   }
  // }, [user, isAdmin, loading, router, pathname]);

  useEffect(() => {
    if (loading) return;

    const isLoginPage = pathname === "/admin/login";

    if (isLoginPage) return;

    // if (pathname === "/admin") {
    //   router.replace("/admin/login");
    //   return;
    // }

    if (!isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 size={40} className="animate-spin" />
      </div>
    );
  }

  if (!isAdmin && pathname !== "/admin/login") return null;

  return (
    <main
      className={`${inter.className} text-(--textColor) flex h-screen p-4 bg-(--softAsh)`}
    >
      <Toaster position="top-left" />

      <ProductProvider>
        <NotificationProvider>
          <div
            className="relative flex w-full h-full rounded-2xl bg-white shadow-lg border border-(--coolGrey) 
              overflow-hidden"
          >
            <Sidebar />

            <AdminMobNav isOpen={isMobNavOpen} setIsOpen={setIsMobNavOpen} />

            <div className="flex-1 flex flex-col min-w-0">
              <AdminSearchProvider>
                <Topbar
                  isOpen={isMobNavOpen}
                  toggleNav={() => setIsMobNavOpen(!isMobNavOpen)}
                />

                <div className="flex-1 p-8 overflow-y-auto ">{children}</div>
              </AdminSearchProvider>
            </div>
          </div>
        </NotificationProvider>
      </ProductProvider>
    </main>
  );
}
