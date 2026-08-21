"use client";

export default function PrisesEnChargePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Prises en charge</h1>
        <p className="mt-2 text-gray-600">
          Définir les maladies prises en charge par chaque hôpital
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Liste des prises en charge</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
            + Ajouter
          </button>
        </div>

        <div className="text-center py-12 text-gray-500">
          <p>Aucune prise en charge enregistrée pour le moment.</p>
          <p className="text-sm mt-2">
            Cette page sera implémentée lors du module Prises en charge.
          </p>
        </div>
      </div>
    </div>
  );
}
