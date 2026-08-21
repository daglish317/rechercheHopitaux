"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface PublicHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onLocateMe: () => void;
  hasPosition: boolean;
}

export default function PublicHeader({ searchQuery, onSearchChange, onLocateMe, hasPosition }: PublicHeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-6 z-20 relative">
      <div className="flex items-center gap-4 flex-1">
        <Link href="/" className="flex-shrink-0">
          <span className="text-xl font-bold text-blue-600">Hopital</span>
        </Link>

        <div className="flex-1 max-w-xl ml-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher un hôpital, une spécialité, un examen..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-4">
        {hasPosition && (
          <button
            onClick={onLocateMe}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 font-medium px-3 py-2 border border-gray-300 rounded-md hover:border-blue-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Ma position
          </button>
        )}

        {isAuthenticated ? (
          <>
            {user?.role === "ADMINISTRATEUR" && (
              <Link
                href="/admin/dashboard"
                className="text-gray-600 hover:text-blue-600 text-sm font-medium px-3 py-2"
              >
                Dashboard
              </Link>
            )}
            <span className="text-sm text-gray-500">{user?.nom}</span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-2"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link
              href="/connexion"
              className="text-gray-700 hover:text-blue-600 text-sm font-medium px-3 py-2"
            >
              Connexion
            </Link>
            <Link
              href="/inscription"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              S&apos;inscrire
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
