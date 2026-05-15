"use client";

import { TrendingUp, ShoppingBag, Users, Calendar } from "lucide-react";
import { formatPrice } from "@/app/(main)/utils/formatPrice";

export const stats = [
  {
    label: "Total Revenue",
    value: formatPrice(5200600),
    icon: TrendingUp,
    trend: "+12%",
  },
  { label: "Active Orders", value: "43", icon: ShoppingBag, trend: "+5%" },
  { label: "New Customers", value: "156", icon: Users, trend: "+18%" },
  { label: "Consultation Leads", value: "12", icon: Calendar, trend: "0%" },
];

// ₦
