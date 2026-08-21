"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Compte créé avec succès
            </h1>
            <p className="text-gray-600 mb-6">
              Vous pouvez maintenant vous connecter avec vos identifiants.
            </p>
            <Link
              href="/connexion"
              className="inline-block bg-blue-600 text-white py-2 px-6 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Créer un compte
          </h1>

          {errors.general && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="nom"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nom
              </label>
              <input
                id="nom"
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nom ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Votre nom"
              />
              {errors.nom && (
                <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="votre@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="motDePasse"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mot de passe
              </label>
              <input
                id="motDePasse"
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.motDePasse ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="••••••••"
              />
              {errors.motDePasse && (
                <p className="mt-1 text-sm text-red-600">{errors.motDePasse}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer mon compte"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Déjà un compte ?{" "}
            <Link
              href="/connexion"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
