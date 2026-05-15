"use client";

import Link from "next/link";
import InfoCard from "../components/infoCard";
import SalesChart from "../components/salesChart";
import server from "@/app/(main)/utils/axiosClient";
import { useNotifications } from "@/providers/admin/notification-provider";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lastUpdated, setCounts } = useNotifications();

  const fetchRecentBookings = useCallback(
    async function (isSilent = false) {
      try {
        if (!isSilent) setLoading(true);

        const response = await server.get("/api/consultations");
        const allBookings = response.data?.bookings || [];

        setCounts((prev) => ({
          ...prev,
          bookings: allBookings.filter((b) => b.status === "pending").length,
        }));

        const pending = allBookings
          .filter((b) => b.status === "pending")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 4);

        setBookings(pending);
      } catch (error) {
        console.error("Error fetching dashboard bookings: ", error.message);
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    [setCounts],
  );

  //  INITIAL LOAD
  useEffect(() => {
    fetchRecentBookings(false);
  }, [fetchRecentBookings]);

  // LIVE SYNC
  useEffect(() => {
    if (!loading) {
      fetchRecentBookings(true);
    }
  }, [fetchRecentBookings, lastUpdated, loading]);

  return (
    <main className="space-y-10">
      {/* Stats Grid */}
      <InfoCard />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-(--lightSilver) min-h-75 flex flex-col justify-between">
          <div className="">
            <h3 className="font-bold text-lg">Sales Overview</h3>
            <p className="text-sm text-(--textMuted)">
              Weekly revenue overview
            </p>

            {/* <select className="mt-1 bg-(--softAsh) text-xs font-semibold p-2 rounded-lg outline-none border-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select> */}
          </div>

          <div className="flex-1 border-2 border-dashed border-(--softAsh) rounded-xl mt-4 p-2">
            <SalesChart />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-(--lightSilver)">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">New Consultations</h3>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2
                  size={24}
                  className="animate-spin text-(--textMuted)"
                />
              </div>
            ) : bookings.length > 0 ? (
              bookings.map((booking) => (
                <Link
                  key={booking._id}
                  href={`/admin/bookings`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-(--softAsh) transition-colors cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-(--coolGrey) flex items-center justify-center text-xs font-bold group-hover:bg-white transition-colors">
                    {booking.name.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{booking.name}</p>
                    <p className="text-[10px] text-(--textMuted) uppercase tracking-wider">
                      {/* {booking.texture?.[0] || "Consultation"} •{" "} */}
                      {new Date(booking.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      •{" "}
                      {new Date(booking.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center py-10 text-xs text-(--textMuted)">
                No new bookings
              </p>
            )}
          </div>

          <Link
            href={`/admin/bookings`}
            className="block text-center w-full mt-6 py-2 text-sm font-medium text-(--textMuted) hover:text-(--textColor) transition-colors"
          >
            View All Bookings
          </Link>
        </div>
      </div>
    </main>
  );
}
