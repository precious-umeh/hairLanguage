"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/admin/auth-provider";

// export default function AdminBasePage() {
//   const router = useRouter();

//   useEffect(() => {
//     router.replace("/");
//   }, [router]);

//   return null;
// }

// admin/page.js
// export default function AdminBasePage() {
//   const router = useRouter();
//   const { isAdmin } = useAuth();

//   useEffect(() => {
//     if (isAdmin) {
//       router.replace("/admin/dashboard"); // Or wherever your main page is
//     } else {
//       router.replace("/admin/login");
//     }
//   }, [isAdmin, router]);

//   return null;
// }

export default function AdminBasePage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (user && isAdmin) {
      router.replace("/admin/dashboard"); // Send to actual admin content
    } else {
      router.replace("/admin/login"); // Send to login if they aren't authorized
    }
  }, [user, isAdmin, loading, router]);

  return null;
}
