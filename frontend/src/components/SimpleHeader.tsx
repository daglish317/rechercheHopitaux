"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { LoginIcon, LogoutIcon } from "./Icons";

export default function SimpleHeader() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 dark:bg-slate-800/95 dark:border-slate-700 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-[1680px] px-4 md:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 rounded-lg focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <img
              src="/logo/orientasoins-logo-white-bg.png"
              alt="SanteProx"
              className="h-8 w-auto sm:h-9"
            />
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {user?.role === "ADMINISTRATEUR" && (
                  <Link
                    href="/admin/dashboard"
                    className="hidden sm:inline-flex rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Dashboard
                  </Link>
                )}
                <span className="hidden md:inline-block max-w-[140px] truncate text-sm text-slate-500 dark:text-slate-400">
                  {user?.nom}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogoutIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/connexion"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <LoginIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Connexion</span>
                </Link>
                <Link
                  href="/inscription"
                  className="rounded-lg bg-teal-600 px-3 sm:px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-teal-600/20 hover:bg-teal-700"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
