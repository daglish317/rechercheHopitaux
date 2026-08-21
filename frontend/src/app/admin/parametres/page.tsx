"use client";

import { AlertIcon } from "@/components/Icons";

export default function ParametresPage() {
  return (
    <div className="admin-dark-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Paramètres</h1>
        <p className="mt-2 text-slate-600">
          Paramètres de la plateforme
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          Configuration générale
        </h2>

        <div className="flex flex-col items-center justify-center py-12 text-slate-600">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <AlertIcon className="w-6 h-6 text-slate-600" />
          </div>
          <p>Les paramètres seront implémentés lors du module Paramètres.</p>
        </div>
      </div>
    </div>
  );
}
