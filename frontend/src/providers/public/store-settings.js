"use client";

import { createContext, useContext, useEffect, useState } from "react";
import server from "@/app/(main)/utils/axiosClient";

const StoreSettingsContext = createContext(null);

export function StoreSettingsProvider({ children }) {
  const [storeSettings, setStoreSettings] = useState(null);
  const [loadingStoreSettings, setLoadingStoreSettings] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await server.get("/api/admin/settings/general/public");
        const data = res.data?.data ?? res.data;
        setStoreSettings(data);
      } catch (error) {
        console.error("Failed to fetch store settings:", error);
      } finally {
        setLoadingStoreSettings(false);
      }
    }

    fetchSettings();
  }, []);

  return (
    <StoreSettingsContext.Provider
      value={{ storeSettings, loadingStoreSettings }}
    >
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}
