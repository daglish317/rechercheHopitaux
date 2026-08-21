"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { LogoutIcon, SearchIcon } from "@/components/Icons";

export default function AdminNavbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-30 border-b border-teal-100 bg-white/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700"
        >
          <SearchIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Retour au site public</span>
          <span className="sm:hidden">Site</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin/profil"
            className="flex items-center gap-2 rounded-xl border border-teal-100 bg-white px-2.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-teal-300 hover:text-teal-700"
          >
            <img
              src="/logo/orientasoins-logo-white-bg.png"
              alt="SanteProx"
              className="h-8 w-auto"
            />
            <span className="hidden max-w-36 truncate sm:inline">{user?.nom}</span>
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
          >
            <LogoutIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Deconnexion</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
