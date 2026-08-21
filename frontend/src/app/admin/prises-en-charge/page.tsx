"use client";

import { PlusIcon } from "@/components/Icons";

export default function PrisesEnChargePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Prises en charge</h1>
        <p className="mt-2 text-slate-600">
          Définir les maladies prises en charge par chaque hôpital
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Liste des prises en charge</h2>
          <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
            <PlusIcon className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        <div className="text-center py-12 text-slate-600">
          <p>Aucune prise en charge enregistrée pour le moment.</p>
          <p className="text-sm mt-2">
            Cette page sera implémentée lors du module Prises en charge.
          </p>
        </div>
      </div>
    </div>
  );
}
