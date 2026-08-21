"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LogoutIcon, SearchIcon } from "@/components/Icons";

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  return (
    <nav
      className={`sticky top-0 z-30 border-b backdrop-blur-xl ${
        theme === "dark"
          ? "border-slate-800/80 bg-slate-950/82"
          : "border-slate-200 bg-white/88"
      }`}
    >
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
            theme === "dark"
              ? "text-slate-200 hover:bg-slate-800 hover:text-teal-300"
              : "text-slate-700 hover:bg-slate-100 hover:text-teal-700"
          }`}
        >
          <SearchIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Retour au site public</span>
          <span className="sm:hidden">Site</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin/profil"
            className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-sm font-medium shadow-sm ${
              theme === "dark"
                ? "border-slate-700 bg-slate-900 text-slate-200 hover:text-teal-300"
                : "border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:text-teal-700"
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-xs font-bold text-white">
              {user?.nom?.charAt(0).toUpperCase() || "A"}
            </div>
            <span className="hidden max-w-36 truncate sm:inline">{user?.nom}</span>
          </Link>
          <button
            type="button"
            onClick={logout}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
              theme === "dark"
                ? "text-slate-300 hover:bg-red-950/40 hover:text-red-300"
                : "text-slate-600 hover:bg-red-50 hover:text-red-600"
            }`}
          >
            <LogoutIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Deconnexion</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
