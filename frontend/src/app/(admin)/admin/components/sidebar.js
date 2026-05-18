"use client";

import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { navLinks } from "../data-sources/navLinks";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useNotifications } from "@/providers/admin/notification-provider";
import { useAuth } from "@/providers/admin/auth-provider";

export default function Sidebar() {
  const [expandSB, setExpandSB] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { counts } = useNotifications();
  const { logout } = useAuth();

  const handleAdminLogout = async function () {
    try {
      await logout();

      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Automatically collapse sidebar when screen is smaller than 'md' (768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setExpandSB(false);
      }
    };

    // set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <aside className="hidden md:block h-full sticky top-0">
      <nav
        className={`bg-(--coolGrey) font-medium h-full py-6 transition-all duration-300 
        ease-in-out overflow-hidden flex flex-col justify-between border-r border-(--lightSilver) 
        ${expandSB ? "md:w-64 px-4" : "w-20 px-2"}`}
      >
        {/* Header (LOGO) */}
        <div className="mb-10 flex flex-col items-center justify-center min-h-15">
          <h2 className="text-2xl text-(--headingPrimary) font-bold tracking-tight transition-all duration-300">
            {expandSB ? "Hair Language" : "HL"}
          </h2>
          {expandSB && (
            <span
              className={`text-[10px] font-extralight uppercase text-(--textMuted) tracking-[0.2em] 
              transition-all duration-300 ${
                expandSB
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2"
              }`}
            >
              Admin Panel
            </span>
          )}
        </div>

        {/* Nav Menu */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar text-sm">
          {navLinks.map((group, i) => (
            <div key={i} className="mb-4">
              {expandSB && (
                <p className="px-4 text-xs text-(--textMuted) font-medium mb-2 tracking-widest uppercase opacity-70">
                  {group.section}
                </p>
              )}

              <div className="space-y-1">
                {group.links.map((link, id) => {
                  const isActive =
                    pathname === link.href ||
                    pathname.startsWith(link.href + "/");

                  const Icon = link.icon;

                  // DYNAMIC NOTIFICATION LOGIC
                  // Check if the link name (e.g. "Bookings") exists as a key in the counts object
                  const categoryKey = link.name.toLowerCase();
                  const hasNotification = counts[categoryKey] > 0;

                  return (
                    <Link
                      key={id}
                      href={link.href}
                      className={`group relative flex items-center w-full p-3 rounded-xl transition-colors
                        ${isActive ? "bg-(--lightSilver) text-(--textColor)" : "text-(--darkGrey) hover:bg-(--lightSilver) hover:text-(--textColor)"}   
                        ${expandSB ? "justify-start px-4" : "justify-center"}`}
                    >
                      <Icon
                        size={20}
                        className="shrink-0 group-hover:scale-110 transition-transform"
                      />

                      {/* THE NOTIFICATION DOT */}
                      {hasNotification && (
                        <span
                          className={`absolute bg-red-500 rounded-full w-1.5 h-1.5 animate-pulse
                          ${
                            expandSB
                              ? "left-3.5 top-1.5 " // Small dot next to icon when expanded
                              : "left-5 top-1.5 " // Small dot on corner when collapsed
                          }`}
                        />
                      )}

                      <span
                        className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden
                          ${expandSB ? "opacity-100 w-auto ml-3" : "opacity-0 w-0"}`}
                      >
                        {link.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-(--lightSilver) space-y-2 text-sm">
          <button
            onClick={() => setExpandSB(!expandSB)}
            className={`group flex items-center w-full p-3 rounded-xl hover:bg-(--lightSilver) transition-colors
              ${expandSB ? "justify-start px-4" : "justify-center"}`}
          >
            <div className="shrink-0 group-hover:scale-110 transition-transform">
              {expandSB ? (
                <PanelLeftClose size={20} />
              ) : (
                <PanelLeftOpen size={20} />
              )}
            </div>
            <span
              className={`transition-all duration-300 whitespace-nowrap overflow-hidden
              ${expandSB ? "opacity-100 w-auto ml-3" : "opacity-0 w-0"}`}
            >
              Collapse
            </span>
          </button>

          <button
            onClick={() => handleAdminLogout()}
            className={`hidden md:flex items-center w-full p-3 rounded-xl hover:bg-red-50 text-(--textMuted)
             hover:text-red-600 transition-colors ${
               expandSB ? "justify-start px-4" : "justify-center"
             }`}
          >
            <LogOut size={22} className="shrink-0" />
            <span
              className={`transition-all duration-300 whitespace-nowrap overflow-hidden
              ${expandSB ? "opacity-100 w-auto ml-3" : "opacity-0 w-0"}`}
            >
              Logout
            </span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
