"use client";

import server from "@/app/(main)/utils/axiosClient";
import { Calendar, EllipsisVertical, Loader2, Mail } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { BASE_URL } from "@/app/(main)/utils/axiosClient";
import { useAdminSearch } from "@/providers/admin/admin-search-provider";

export default function Customers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const { searchQuery } = useAdminSearch();
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const fetchUsers = useCallback(async function (isSilent = false) {
    if (!isSilent) setLoading(true);

    try {
      const response = await server.get("/auth/get-users");

      setUsers(response.data?.data || []);
    } catch (error) {
      if (!isSilent) {
        toast.error(error.response?.data?.message || "Error retrieving users.");
        setUsers([]);
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();

    const interval = setInterval(() => {
      fetchUsers(true);
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchUsers]);

  const filteredUsers = users.filter((user) => {
    if (!normalizedQuery) return true;

    const haystack = [user.name, user.email, user.role]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  if (loading)
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-(--accent)" />
      </div>
    );

  return (
    <main className="space-y-10">
      <Toaster position="top-left" />
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-(--textMuted) uppercase tracking-[0.2em]">
            User Directory
          </h2>
          <p className="text-xs text-(--textMuted) mt-1 font-medium">
            Manage registered users and account verifications
          </p>
          <p className="text-xs text-(--textMuted) mt-1 font-medium">
            Showing {filteredUsers.length} total{" "}
            {filteredUsers.length === 1 ? "user" : "users"}
            {normalizedQuery ? ` matching "${searchQuery.trim()}"` : ""}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            return (
              <div
                key={user._id}
                className="bg-white border border-(--coolGrey) shadow-sm p-4 rounded-xl space-y-4"
              >
                <div className="flex items-start justify-between w-full">
                  <div
                    className="w-16 h-16 rounded-md bg-(--softAsh) border-4 border-(--lightSilver) 
                    shadow-sm relative"
                  >
                    <img
                      src={`${BASE_URL}${user.avatar}`}
                      alt="Avatar"
                      className="w-full h-full object-cover rounded"
                    />

                    {/* <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${user.status ? "bg-green-500" : "bg-(--textMuted)"}`}
                  /> */}
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                      {user.status && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      )}
                      <span
                        className={`relative inline-flex rounded-full h-4 w-4 border-2 border-white ${
                          user.status ? "bg-green-500" : "bg-(--textMuted)"
                        }`}
                      />
                    </span>
                  </div>

                  <button
                    className="w-6 h-6 flex items-center justify-center rounded-full
                   bg-transparent hover:bg-(--softAsh) transition"
                  >
                    <EllipsisVertical
                      size={20}
                      className="text-(--textMuted)"
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-bold text-(--textColor) capitalize">
                    {user.name}
                  </p>
                  <span
                    className="text-xs text-(--textMuted) font-medium break-all flex 
                    items-start gap-1"
                  >
                    <Mail size={16} />
                    {user.email}
                  </span>
                </div>

                <div className="border-t border-(--lightSilver)">
                  <div className="flex items-start gap-1 mt-4 text-(--textMuted)">
                    <Calendar size={14} />
                    <p className="text-[10px] font-medium">
                      Joined since{" "}
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-NG", {
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-(--textMuted) text-sm">
            {normalizedQuery
              ? `No users found for "${searchQuery.trim()}".`
              : "No users found."}
          </div>
        )}
      </div>
    </main>
  );
}
