"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  HospitalIcon,
  CheckCircleIcon,
  AlertIcon,
  UserIcon,
  MailIcon,
  LockIcon,
} from "@/components/Icons";

export default function InscriptionPage() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!nom.trim()) {
      newErrors.nom = "Le nom est obligatoire.";
    }

    if (!email.trim()) {
      newErrors.email = "L'email est obligatoire.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "L'email n'est pas valide.";
    }

    if (!motDePasse) {
      newErrors.motDePasse = "Le mot de passe est obligatoire.";
    } else if (motDePasse.length < 8) {
      newErrors.motDePasse = "Le mot de passe doit contenir au moins 8 caracteres.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await register(nom, email, motDePasse);
      setSuccess(true);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: Record<string, string[]> } };
        if (axiosError.response?.data) {
          const apiErrors = axiosError.response.data;
          const newErrors: { [key: string]: string } = {};

          if (apiErrors.nom) {
            newErrors.nom = Array.isArray(apiErrors.nom)
              ? apiErrors.nom[0]
              : String(apiErrors.nom);
          }
          if (apiErrors.email) {
            newErrors.email = Array.isArray(apiErrors.email)
              ? apiErrors.email[0]
              : String(apiErrors.email);
          }
          if (apiErrors.motDePasse) {
            newErrors.motDePasse = Array.isArray(apiErrors.motDePasse)
              ? apiErrors.motDePasse[0]
              : String(apiErrors.motDePasse);
          }

          setErrors(newErrors);
        }
      } else {
        setErrors({ general: "Une erreur est survenue lors de la création du compte." });
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200 border border-slate-100 p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 mb-6">
                <CheckCircleIcon className="w-12 h-12 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-4">
                Compte créé avec succès
              </h1>
              <p className="text-slate-600 mb-8">
                Vous pouvez maintenant vous connecter avec vos identifiants.
              </p>
              <Link
                href="/connexion"
                className="inline-block w-full sm:w-auto bg-blue-600 text-white py-3 px-8 rounded-xl font-semibold shadow-md shadow-blue-600/25 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2">
              <HospitalIcon className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-blue-600 tracking-tight">
                Hopital
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200 border border-slate-100 p-6 sm:p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <UserIcon className="w-7 h-7 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 text-center">
                Créer un compte
              </h1>
              <p className="mt-1 text-sm text-slate-600 text-center">
                Rejoignez-nous en quelques secondes
              </p>
            </div>

            {errors.general && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl mb-6 text-sm">
                <AlertIcon className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="nom"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Nom
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <UserIcon className="w-5 h-5 text-slate-400" />
                  </span>
                  <input
                    id="nom"
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 text-slate-900 placeholder:text-slate-400 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors ${
                      errors.nom ? "border-red-500" : "border-slate-300"
                    }`}
                    placeholder="Votre nom"
                  />
                </div>
                {errors.nom && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.nom}</p>
                )}
              </div>

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
                    className={`w-full pl-11 pr-4 py-3 text-slate-900 placeholder:text-slate-400 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors ${
                      errors.email ? "border-red-500" : "border-slate-300"
                    }`}
                    placeholder="votre@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
                )}
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
                    minLength={8}
                    className={`w-full pl-11 pr-4 py-3 text-slate-900 placeholder:text-slate-400 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors ${
                      errors.motDePasse ? "border-red-500" : "border-slate-300"
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.motDePasse && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.motDePasse}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-4 rounded-xl font-semibold shadow-md shadow-blue-600/25 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Création..." : "Créer mon compte"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Déjà un compte ?{" "}
              <Link
                href="/connexion"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
