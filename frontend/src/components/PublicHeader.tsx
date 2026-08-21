"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";
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
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/88 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/88">
      <div className="flex min-h-20 flex-col gap-3 px-3 py-3 sm:px-5 lg:flex-row lg:items-center lg:px-7">
        <div className="flex items-center gap-4 lg:w-[390px]">
          <Link
            href="/"
            className="flex-shrink-0 rounded-lg focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <img
              src="/logo/logo-horizontal-light.svg"
              alt="SanteProx"
              className="h-9 w-auto"
            />
          </Link>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Recherche hospitaliere
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              RDC et structures referencees
            </p>
          </div>
        </div>

        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher un hopital, une specialite, un examen..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-24 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {hasSearched ? `${resultCount} resultat${resultCount > 1 ? "s" : ""}` : "Pret"}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 lg:justify-end">
          {hasPosition && (
            <button
              type="button"
              onClick={onLocateMe}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:border-teal-300 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-teal-300"
            >
              <MapPinIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Ma position</span>
            </button>
          )}

          <ThemeToggle />

          {isAuthenticated ? (
            <>
              {user?.role === "ADMINISTRATEUR" && (
                <Link
                  href="/admin/dashboard"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Dashboard
                </Link>
              )}
              <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:inline">
                {user?.nom}
              </span>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                <LogoutIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Deconnexion</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <LoginIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Connexion</span>
              </Link>
              <Link
                href="/inscription"
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-teal-600/20 hover:bg-teal-700"
              >
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
