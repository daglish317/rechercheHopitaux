"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { LoginIcon, LogoutIcon } from "./Icons";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="border-b border-teal-100 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center rounded-lg focus-visible:ring-2 focus-visible:ring-teal-500">
          <img
            src="/logo/orientasoins-logo-white-bg.png"
            alt="SanteProx"
            className="h-9 w-auto"
          />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700"
          >
            Accueil
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === "ADMINISTRATEUR" && (
                <Link
                  href="/admin/dashboard"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700"
                >
                  Dashboard
                </Link>
              )}
              <span className="hidden max-w-32 truncate text-sm text-slate-500 sm:inline">
                {user?.nom}
              </span>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogoutIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Deconnexion</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700"
              >
                <LoginIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Connexion</span>
              </Link>
              <Link
                href="/inscription"
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-teal-600/20 hover:bg-teal-700"
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
