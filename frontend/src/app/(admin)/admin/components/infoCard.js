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
// import { stats } from "../data-sources/stats";

export default function InfoCard() {
  const { counts } = useNotifications();

  const stats = [
    {
      label: "Total Revenue",
      value: formatPrice(5200600),
      icon: TrendingUp,
      trend: "+12%",
    },
    {
      label: "Active Orders",
      value: counts?.orders || 0,
      icon: ShoppingBag,
      trend: "0%",
    },
    { label: "New Customers", value: "156", icon: Users, trend: "+18%" },
    {
      label: "Consultation Requests",
      value: counts?.bookings || 0,
      icon: Calendar,
      trend: "0%",
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
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                {stat.trend} <ArrowUpRight size={12} />
              </span>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-(--textMuted)">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-(--headingPrimary) mt-1">
                {stat.value}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
