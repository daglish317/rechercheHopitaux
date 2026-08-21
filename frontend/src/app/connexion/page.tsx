"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  HospitalIcon,
  LoginIcon,
  MailIcon,
  LockIcon,
  AlertIcon,
} from "@/components/Icons";

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, motDePasse);
    } catch {
      setError("Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-teal-100 bg-white/95 shadow-sm shadow-teal-900/5 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center rounded-lg focus-visible:ring-2 focus-visible:ring-teal-500">
            <img
              src="/logo/orientasoins-logo-white-bg.png"
              alt="SanteProx"
              className="h-9 w-auto"
            />
          </Link>
          
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12 pt-28 sm:py-16 sm:pt-28">
        <div className="w-full max-w-md">
          

          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200 border border-slate-100 p-6 sm:p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <LoginIcon className="w-7 h-7 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 text-center">
                Connexion
              </h1>
              <p className="mt-1 text-sm text-slate-600 text-center">
                Accédez à votre espace personnel
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl mb-6 text-sm">
                <AlertIcon className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <MailIcon className="w-5 h-5 text-slate-400" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="motDePasse"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <LockIcon className="w-5 h-5 text-slate-400" />
                  </span>
                  <input
                    id="motDePasse"
                    type="password"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-4 rounded-xl font-semibold shadow-md shadow-blue-600/25 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Pas encore de compte ?{" "}
              <Link
                href="/inscription"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
