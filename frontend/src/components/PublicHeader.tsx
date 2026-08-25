"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { SearchIcon, MapPinIcon, LoginIcon, LogoutIcon } from "./Icons";

interface PublicHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onLocateMe: () => void;
  hasPosition: boolean;
  resultCount?: number;
  hasSearched?: boolean;
}

export default function PublicHeader({
  searchQuery,
  onSearchChange,
  onLocateMe,
  hasPosition,
  resultCount = 0,
  hasSearched = false,
}: PublicHeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 shadow-sm shadow-slate-900/5 backdrop-blur-xl">
      <div className="mx-auto max-w-[1680px] px-3 py-3 sm:px-5 lg:px-7">
        <div className="grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
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
              <Link
                href="/"
                className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 lg:inline-flex"
              >
                Accueil
              </Link>
            </div>

            <div className="flex items-center gap-1.5 lg:hidden">
              {isAuthenticated ? (
                <>
                  {user?.role === "ADMINISTRATEUR" && (
                    <Link
                      href="/admin/dashboard"
                      className="rounded-lg px-2.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 sm:px-3"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center justify-center rounded-lg px-2.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 sm:px-3"
                    aria-label="Déconnexion"
                  >
                    <LogoutIcon className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/connexion"
                    className="inline-flex items-center justify-center rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 sm:px-3"
                    aria-label="Connexion"
                  >
                    <LoginIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/inscription"
                    className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-teal-600/20 hover:bg-teal-700"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="relative w-full lg:mx-auto lg:max-w-2xl">
            <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:h-5 sm:w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher un hôpital, une spécialité, un examen..."
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-20 text-sm text-slate-900 shadow-sm shadow-slate-900/5 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/15 sm:h-12 sm:pr-24"
            />
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 sm:px-3 sm:text-xs">
              {hasSearched ? `${resultCount} résultat${resultCount > 1 ? "s" : ""}` : "Prêt"}
            </div>
          </div>

          <div className="hidden items-center justify-end gap-2 lg:flex">
            <button
              type="button"
              onClick={onLocateMe}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium shadow-sm transition-colors ${
                hasPosition
                  ? "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
                  : "border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
              }`}
              title={hasPosition ? "Recentrer sur ma position" : "Utiliser ma position"}
            >
              <MapPinIcon className="h-4 w-4" />
              <span>{hasPosition ? "Position" : "Ma position"}</span>
            </button>

            {isAuthenticated ? (
              <>
                {user?.role === "ADMINISTRATEUR" && (
                  <Link
                    href="/admin/dashboard"
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Dashboard
                  </Link>
                )}
                <span className="max-w-[140px] truncate text-sm text-slate-500">
                  {user?.nom}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogoutIcon className="h-4 w-4" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/connexion"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <LoginIcon className="h-4 w-4" />
                  Connexion
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

          <div className="flex items-center justify-between gap-2 lg:hidden">
            <button
              type="button"
              onClick={onLocateMe}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors ${
                hasPosition
                  ? "border-teal-200 bg-teal-50 text-teal-700"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
              title={hasPosition ? "Recentrer sur ma position" : "Utiliser ma position"}
            >
              <MapPinIcon className="h-4 w-4" />
              <span>{hasPosition ? "Position" : "Ma position"}</span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <span className="hidden max-w-[110px] truncate text-sm text-slate-500 sm:inline">
                  {user?.nom}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center justify-center rounded-lg px-2.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 sm:px-3"
                  aria-label="Déconnexion"
                >
                  <LogoutIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/connexion"
                className="inline-flex items-center justify-center rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 sm:px-3"
                aria-label="Connexion"
              >
                <LoginIcon className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
