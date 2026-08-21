"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Administrateur
        </h1>
        <p className="mt-2 text-gray-600">
          Bienvenue, {user?.nom}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Utilisateurs
          </h3>
          <p className="text-3xl font-bold text-blue-600">--</p>
          <p className="text-sm text-gray-500 mt-1">Total utilisateurs</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Hopitaux
          </h3>
          <p className="text-3xl font-bold text-green-600">--</p>
          <p className="text-sm text-gray-500 mt-1">Total hopitaux</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Recherches
          </h3>
          <p className="text-3xl font-bold text-purple-600">--</p>
          <p className="text-sm text-gray-500 mt-1">Aujourd&apos;hui</p>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Modules d&apos;administration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/admin/hopitaux"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">🏥 Hôpitaux</h3>
            <p className="text-sm text-gray-500 mt-1">
              Gérer les hôpitaux enregistrés
            </p>
          </a>
          <a
            href="/admin/types-hopitaux"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">🏷️ Types d&apos;hôpitaux</h3>
            <p className="text-sm text-gray-500 mt-1">
              Gérer le catalogue des types
            </p>
          </a>
          <a
            href="/admin/maladies"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">🦠 Maladies</h3>
            <p className="text-sm text-gray-500 mt-1">
              Gérer le catalogue des maladies
            </p>
          </a>
          <a
            href="/admin/prises-en-charge"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">💊 Prises en charge</h3>
            <p className="text-sm text-gray-500 mt-1">
              Définir les maladies prises en charge
            </p>
          </a>
          <a
            href="/admin/examens-medicaux"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">🔬 Examens médicaux</h3>
            <p className="text-sm text-gray-500 mt-1">
              Gérer les examens et associations
            </p>
          </a>
          <a
            href="/admin/plateau-technique"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">⚙️ Plateau technique</h3>
            <p className="text-sm text-gray-500 mt-1">
              Gérer le plateau technique
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
