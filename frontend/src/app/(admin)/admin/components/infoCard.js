"use client";

import {
  ArrowUpRight,
  TrendingUp,
  ShoppingBag,
  Users,
  Calendar,
} from "lucide-react";
import { formatPrice } from "@/app/(main)/utils/formatPrice";
import { useNotifications } from "@/providers/admin/notification-provider";
import { useEffect, useState } from "react";
import server from "@/app/(main)/utils/axiosClient";
import toast from "react-hot-toast";

export default function InfoCard() {
  const { counts } = useNotifications();

  // Local state for analytics variables fetched safely from database aggregation
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalCustomers: 0,
  });

  useEffect(() => {
    async function fetchAnalyticsSummary() {
      try {
        const response = await server.get("/api/admin/dashboard-stats");

        if (response.data.success) {
          setAnalytics({
            totalRevenue: response.data.data.totalRevenue,
            totalCustomers: response.data.data.totalCustomers,
          });
        }
      } catch (error) {
        console.error("Dashboard Stats Calculation Failed:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch dashboard stats.",
        );
      }
    }
    fetchAnalyticsSummary();
  }, [counts?.orders]); // Re-fetch analytics figures automatically if order counts update in the background

  const stats = [
    {
      label: "Total Revenue",
      value: formatPrice(analytics.totalRevenue),
      icon: TrendingUp,
      trend: "Live",
    },
    {
      label: "Active Orders",
      value: counts?.orders || 0,
      icon: ShoppingBag,
      trend: "Realtime",
    },
    {
      label: "Total Customers",
      value: analytics.totalCustomers.toString(),
      icon: Users,
      trend: "Patrons",
    },
    {
      label: "Consultation Requests",
      value: counts?.bookings || 0,
      icon: Calendar,
      trend: "Pending",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, id) => {
        const Icon = stat.icon;

        return (
          <div
            key={id}
            className="bg-white p-6 rounded-2xl border border-(--lightSilver) shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-lg bg-(--softAsh)">
                <Icon size={20} className="text-(--headingPrimary)" />
              </div>
              <span className="text-xs font-black tracking-wider text-green-700 bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                {stat.trend} <ArrowUpRight size={12} />
              </span>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-(--textMuted)">
                {stat.label}
              </p>
              <h3 className="text-2xl font-black text-(--headingPrimary) mt-1 tracking-tight">
                {stat.value}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
