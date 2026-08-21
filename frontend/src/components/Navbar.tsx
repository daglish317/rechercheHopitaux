"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">Hopital</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              Accueil
            </Link>

            {isAuthenticated ? (
              <>
                {user?.role === "ADMINISTRATEUR" && (
                  <Link
                    href="/admin/dashboard"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                )}
                <span className="text-gray-500 text-sm">{user?.nom}</span>
                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/connexion"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
