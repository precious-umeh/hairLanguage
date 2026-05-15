"use client";

import {
  useContext,
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import server from "@/app/(main)/utils/axiosClient";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  // State for all Notification types
  const [counts, setCounts] = useState({
    bookings: 0,
    messages: 0, // Contact us TODO
    orders: 0, // Product orders TODO
  });

  // State to display last sync time
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Ref for sound
  const prevTotalRef = useRef(null);

  // Function to refresh the counts from the Database
  const refreshAllCounts = useCallback(async () => {
    try {
      const [bookingRes, messageRes] = await Promise.all([
        server.get("/api/consultations"),
        server.get("/api/contact"),
      ]);

      const newBookingCount =
        bookingRes.data?.bookings?.filter((b) => b.status === "pending")
          .length || 0;
      const newMessageCount =
        messageRes.data?.data?.filter((m) => m.status === "pending").length ||
        0;

      const newTotal = newBookingCount + newMessageCount;

      // Only play sound if it's NOT the first load AND the count increased
      if (prevTotalRef.current !== null && newTotal > prevTotalRef.current) {
        const audio = new Audio("/sounds/notification-sound.wav");
        audio
          .play()
          .catch((err) => console.log(`Audio play blocked by browser: `, err));
      }

      // Update Ref
      prevTotalRef.current = newTotal;

      const newCounts = {
        bookings: newBookingCount,
        messages: newMessageCount,
        orders: 0,
      };

      setCounts(newCounts);
      setLastUpdated(new Date());
    } catch (error) {
      console.error(`Sync failed`, error.message);
    }
  }, []);

  // Call the function on mount!
  useEffect(() => {
    refreshAllCounts();

    const interval = setInterval(() => {
      refreshAllCounts();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshAllCounts]);

  const totalUnread = counts.bookings + counts.messages + counts.orders;

  return (
    <NotificationContext.Provider
      value={{
        counts,
        setCounts,
        refreshAllCounts,
        totalUnread,
        lastUpdated,
        setLastUpdated,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}
