"use client";

import { useEffect } from "react";
import { navLinks } from "../data-sources/navLinks";
import { usePathname } from "next/navigation";
import { useNotifications } from "@/providers/admin/notification-provider";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { useAuth } from "@/providers/admin/auth-provider";
import { BASE_URL } from "@/app/(main)/utils/axiosClient";

export default function AdminMobNav({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const { counts } = useNotifications();
  const { user, logout } = useAuth();

  const handleLogout = async function () {
    try {
      await logout();
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout Failed:", error);
    }
  };

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className="md:hidden">
      <div
        onClick={() => setIsOpen(false)}
        className={`absolute left-0 top-17.75 w-full h-[calc(100%-71px)] bg-(--textColor)/40 backdrop-blur-sm md:hidden transition-opacity duration-300 z-9998 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute left-0 top-0 w-[85%] max-w-sm h-full bg-white z-9999 
            transform transition-transform duration-300 ${
              isOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="flex flex-col gap-6 h-full">
            <div className="mt-6 px-2 flex-1 overflow-y-auto">
              {navLinks.map((group, i) => (
                <div key={i} className="mb-3">
                  <p className="px-4 text-xs text-(--textMuted) font-medium mb-1 tracking-widest uppercase opacity-70">
                    {group.section}
                  </p>

                  <div className="space-y-1 px-4">
                    {group.links.map((link, id) => {
                      const isActive =
                        pathname === link.href ||
                        pathname.startsWith(link.href + "/");

                      const Icon = link.icon;

                      const categoryKey = link.name.toLowerCase();
                      const hasNotifications = counts[categoryKey] > 0;

                      return (
                        <Link
                          key={id}
                          href={link.href}
                          className={`group relative flex items-center w-full p-3 rounded-xl transition-colors ${
                            isActive
                              ? "bg-(--lightSilver) text-(--textColor)"
                              : "text-(--darkGrey)"
                          }`}
                        >
                          <Icon
                            size={20}
                            className="group-hover:scale-110 transition-transform"
                          />

                          <span className="ml-3">{link.name}</span>

                          {hasNotifications && (
                            <span className="absolute left-2 top-2 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-(--softAsh) h-35 px-6 py-4.5 flex flex-col justify-between">
              <Link href="/admin/profile">
                <div className="flex items-center gap-2">
                  <div
                    className="h-10 w-10 rounded-full bg-(--softAsh) border border-(--lightSilver) flex 
                    items-center justify-center font-bold text-xs overflow-hidden"
                  >
                    <img
                      // src={`${BASE_URL}${user?.avatar}`}
                      src={
                        user?.avatar?.startsWith("http")
                          ? user.avatar
                          : `${BASE_URL}${user.avatar}`
                      }
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <p className="font-semibold text-sm leading-none">
                    {user?.name.split(" ").slice(0, 2).join(" ") ||
                      "Admin User"}
                    <span className="block uppercase text-(--textMuted) text-[9px] font-medium mt-1">
                      {user?.role || "Admin"}
                    </span>
                  </p>
                </div>
              </Link>

              <button
                onClick={() => handleLogout()}
                className="flex items-center gap-2 -ml-1 bg-red-100 text-red-600 p-3 rounded-lg"
              >
                <LogOut size={25} />{" "}
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
