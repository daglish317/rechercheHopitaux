"use client";

import { PlusIcon } from "@/components/Icons";

export default function PrisesEnChargePage() {
  return (
    <div className="admin-dark-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Prises en charge</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Définir les maladies prises en charge par chaque hôpital
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Liste des prises en charge
          </h2>
          <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400">
            <PlusIcon className="h-4 w-4" />
            Ajouter
          </button>
        </div>

        <div className="py-12 text-center text-slate-600 dark:text-slate-400">
          <p>Aucune prise en charge enregistrée pour le moment.</p>
          <p className="mt-2 text-sm">
            Cette page sera implémentée lors du module Prises en charge.
          </p>
        </div>
      </div>
    </div>
  );
}
