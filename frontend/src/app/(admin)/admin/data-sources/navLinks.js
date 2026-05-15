"use client";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  CalendarCheck,
  Mail,
  Send,
  Settings,
} from "lucide-react";

export const navLinks = [
  {
    section: "Main",
    links: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    section: "Management",
    links: [
      { name: "Products", href: "/admin/products", icon: Package },
      { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { name: "Users", href: "/admin/customers", icon: Users },
    ],
  },
  {
    section: "Communication",
    links: [
      { name: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
      { name: "Messages", href: "/admin/messages", icon: Mail },
      { name: "Newsletter", href: "/admin/newsletter", icon: Send },
    ],
  },
  {
    section: "System",
    links: [{ name: "Settings", href: "/admin/settings", icon: Settings }],
  },
];
