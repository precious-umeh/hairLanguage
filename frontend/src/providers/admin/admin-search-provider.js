"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";

// Routes where topbar search is enabled
const SEARCH_CONFIG = {
  "/admin/products": {
    enabled: true,
    placeholder: "Search products by name, category, type...",
  },
  "/admin/orders": {
    enabled: true,
    placeholder: "Search orders by ID, email, status...",
  },
  "/admin/customers": {
    enabled: true,
    placeholder: "Search users by name or email...",
  },
  "/admin/transactions": {
    enabled: true,
    placeholder: "Search reference, email, or order ID...",
  },
  "/admin/bookings": {
    enabled: true,
    placeholder: "Search bookings by name, email, phone...",
  },
  "/admin/messages": {
    enabled: true,
    placeholder: "Search messages by name, email, subject...",
  },
  "/admin/newsletter": {
    enabled: true,
    placeholder: "Search subscribers by email...",
  },
};

// Routes where search should be hidden
const SEARCH_DISABLED_PREFIXES = [
  "/admin/dashboard",
  "/admin/settings",
  "/admin/profile",
];

function getSearchConfig(pathname) {
  if (SEARCH_CONFIG[pathname]) {
    return SEARCH_CONFIG[pathname];
  }

  const isDisabled = SEARCH_DISABLED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );

  if (isDisabled) {
    return { enabled: false, placeholder: "" };
  }

  // Default: disabled on unknown admin pages
  return { enabled: false, placeholder: "" };
}

const AdminSearchContext = createContext(null);

export function AdminSearchProvider({ children }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const searchConfig = useMemo(() => getSearchConfig(pathname), [pathname]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Clear query when navigating between admin pages
  useEffect(() => {
    setSearchQuery("");
  }, [pathname]);

  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      clearSearch,
      isSearchEnabled: searchConfig.enabled,
      searchPlaceholder: searchConfig.placeholder,
    }),
    [searchQuery, clearSearch, searchConfig],
  );

  return (
    <AdminSearchContext.Provider value={value}>
      {children}
    </AdminSearchContext.Provider>
  );
}

export function useAdminSearch() {
  const context = useContext(AdminSearchContext);

  if (!context) {
    throw new Error("useAdminSearch must be used within AdminSearchProvider");
  }

  return context;
}
