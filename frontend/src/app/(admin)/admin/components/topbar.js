"use client";

import { Bell, Menu, Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useNotifications } from "@/providers/admin/notification-provider";
import { navLinks } from "../data-sources/navLinks";
import Link from "next/link";
import { useAuth } from "@/providers/admin/auth-provider";
import { BASE_URL } from "@/app/(main)/utils/axiosClient";
import { useAdminSearch } from "@/providers/admin/admin-search-provider";

export default function Topbar({ isOpen, toggleNav }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const {
    searchQuery,
    setSearchQuery,
    clearSearch,
    isSearchEnabled,
    searchPlaceholder,
  } = useAdminSearch();

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return "AD";
    const names = name.split(" ");
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Logic to format the title based on the URL
  const getTitle = (path) => {
    const staticPages = {
      "/admin/profile": "Account Profile",
    };

    if (staticPages[path]) return staticPages[path];

    for (const section of navLinks) {
      for (const link of section.links) {
        if (path === link.href || path.startsWith(link.href + "/")) {
          return link.name;
        }
      }
    }

    return "Dashboard";
  };

  // const getTitle = (path) => {
  //   if (path === "/admin") return "Dashboard";

  //   // Removes '/admin/', takes the last segment, and capitalizes it
  //   const segment = path.split("/").pop() || "";
  //   return segment.charAt(0).toUpperCase() + segment.slice(1);
  // };

  const title = getTitle(pathname);

  const { totalUnread } = useNotifications();

  return (
    <header className="relative">
      <nav
        className="flex items-center justify-between p-4 md:px-10 md:py-5 border-b border-(--lightSilver)
        bg-white/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm"
      >
        {/* LEFT: Menu / Title */}
        <div
          className={`flex items-center ${isSearchOpen ? "opacity-0" : "opacity-100"}`}
        >
          <button
            onClick={toggleNav}
            className="md:hidden p-1 -ml-1 text-(--textColor)"
          >
            {isOpen ? <X size={25} /> : <Menu size={25} />}
          </button>

          <div className="hidden md:block">
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-(--headingPrimary)">
              {title}
            </h1>
            <div className="hidden md:flex items-center gap-1 mt-1">
              <span className="text-[9px] text-(--textMuted) uppercase tracking-widest">
                Admin /
              </span>

              <span className="text-[9px] text-(--accent) uppercase tracking-widest font-semibold">
                {title} Overview
              </span>
            </div>
          </div>
        </div>

        {/* CENTER: Logo */}
        <div
          className={`md:hidden absolute left-1/2 -translate-x-1/2 ${
            isSearchOpen ? "opacity-0" : "opacity-100"
          }`}
        >
          <img
            src="/images/hairLanguageLogo/logo-black.png"
            className="w-20"
            alt="Logo"
          />
        </div>

        {/* RIGHT: Search & Notification */}
        <div
          className={`flex items-center gap-1 md:gap-6 ${isSearchOpen ? "opacity-0" : "opacity-100"}`}
        >
          {/* Search Trigger*/}
          {isSearchEnabled ? (
            <>
              {/* Desktop search input */}
              <div className="hidden md:flex items-center gap-2 p-2 md:px-3 md:py-1.5 md:rounded-full md:border md:border-(--lightSilver) md:bg-(--softAsh)">
                <Search size={16} className="text-(--textMuted) shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="outline-none text-sm w-28 lg:w-52 bg-transparent text-(--textColor) placeholder:text-(--textMuted) placeholder:text-[10px]"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="text-(--textMuted) hover:text(--textColor)"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Mobile search trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 md:hidden flex items-center gap-2"
                aria-label="Open search"
              >
                <Search size={16} className="text-(--textMuted)" />
              </button>
            </>
          ) : null}

          {/* Notifications */}
          <button className="p-2 text-(--textMuted) hover:text-(--textColor) transition-colors relative">
            <Bell size={22} className=" cursor-pointer" />
            {totalUnread > 0 && (
              <span
                className="absolute top-1 right-1.5 min-w-4.5 h-4.5 px-1 bg-red-600 rounded-full border-2 
                border-white flex items-center justify-center text-[9px] font-bold text-white tabular-nums shadow-sm"
              >
                {totalUnread > 99 ? "99+" : totalUnread}
              </span>
            )}
          </button>

          {/* Profile */}
          <Link href="/admin/profile">
            <div className="hidden md:flex items-center gap-3 ml-2 pl-6 border-l border-(--lightSilver)">
              <div className="text-right">
                <p className="text-xs font-bold leading-none">
                  {user?.name.split(" ").slice(0, 2).join(" ") || "Admin User"}
                </p>
                <p className="text-[9px] text-(--textMuted) mt-1 uppercase">
                  {user?.role || "Admin"}
                </p>
              </div>

              <div
                className="w-10 h-10 rounded-full bg-(--softAsh) border border-(--lightSilver) flex 
                items-center justify-center font-bold text-xs overflow-hidden"
              >
                {user?.avatar ? (
                  <img
                    src={`${BASE_URL}${user.avatar}`}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(user?.name)
                )}
              </div>
            </div>
          </Link>
        </div>
      </nav>

      {/* Full Screen Mobile Search Overlay */}
      {isSearchOpen && isSearchEnabled && (
        <div className="absolute inset-0 bg-white flex items-center px-4 z-20">
          <div className="flex items-center gap-3 w-full bg-(--softAsh) px-4 py-2 rounded-xl border border-(--lightSilver)">
            <Search size={18} className="text-(--textMuted)" />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="bg-transparent outline-none text-sm w-full text-(--textColor)"
            />
            <button type="button" onClick={() => setIsSearchOpen(false)}>
              <X
                size={18}
                className="text-(--textMuted) hover:text-(--textColor)"
              />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
