"use client";

import { useState } from "react";
import { HopitalSearchResult } from "@/lib/public";
import {
  MapPinIcon,
  PhoneIcon,
  AlertIcon,
  NavigationIcon,
} from "@/components/Icons";

interface NearbyViewProps {
  locatedHospitals: HopitalSearchResult[];
  notLocatedHospitals: HopitalSearchResult[];
  selectedId: number | null;
  onSelect: (hospital: HopitalSearchResult) => void;
  onShowDetails: (hospitalId: number) => void;
  userPosition: [number, number] | null;
}

type RadiusOption = 5 | 10 | 20 | 50 | 999;

export default function NearbyView({
  locatedHospitals,
  notLocatedHospitals,
  selectedId,
  onSelect,
  onShowDetails,
  userPosition,
}: NearbyViewProps) {
  const [selectedRadius, setSelectedRadius] = useState<RadiusOption>(20);

  if (!userPosition) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-6">
        <div className="text-center max-w-md">
          <NavigationIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Position non activée
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Activez votre géolocalisation pour voir les hôpitaux proches de
            vous.
          </p>
        </div>
      </div>
    );
  }

  // Filtrer par rayon
  const filteredLocated = locatedHospitals.filter((h) => {
    if (selectedRadius === 999) return true;
    return h.distance_km !== null && h.distance_km <= selectedRadius;
  });

  const radiusOptions: { value: RadiusOption; label: string }[] = [
    { value: 5, label: "5 km" },
    { value: 10, label: "10 km" },
    { value: 20, label: "20 km" },
    { value: 50, label: "50 km" },
    { value: 999, label: "Tous" },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header avec sélecteur de rayon */}
      <div className="px-4 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <MapPinIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Dans un rayon de
          </h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          {radiusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedRadius(option.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedRadius === option.value
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des résultats */}
      <div className="flex-1 overflow-y-auto">
        {/* Hôpitaux localisés */}
        {filteredLocated.length > 0 && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Hôpitaux localisés ({filteredLocated.length})
              </h4>
            </div>
            <div className="space-y-3">
              {filteredLocated.map((hospital) => (
                <div
                  key={hospital.id}
                  className={`bg-white dark:bg-slate-800 rounded-xl p-4 border-2 transition-all ${
                    selectedId === hospital.id
                      ? "border-blue-500 shadow-md"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <h5 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {hospital.nom}
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {hospital.type_hopital_nom}
                  </p>

                  {/* Distance */}
                  {hospital.distance_text && (
                    <div className="flex items-center gap-2 mb-2">
                      <MapPinIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {hospital.distance_text}
                      </span>
                    </div>
                  )}

                  {/* Adresse */}
                  <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 mb-1">
                    <MapPinIcon className="w-3 h-3 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{hospital.adresse}</span>
                  </div>

                  {/* Téléphone */}
                  {hospital.telephone && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-3">
                      <PhoneIcon className="w-3 h-3 shrink-0" />
                      <span>{hospital.telephone}</span>
                    </div>
                  )}

                  <button
                    onClick={() => onShowDetails(hospital.id)}
                    className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Voir les détails
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message si aucun dans le rayon */}
        {filteredLocated.length === 0 && locatedHospitals.length > 0 && (
          <div className="p-6 text-center">
            <AlertIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Aucun hôpital dans un rayon de {selectedRadius} km.
            </p>
            <button
              onClick={() => setSelectedRadius(999)}
              className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Voir tous les hôpitaux
            </button>
          </div>
        )}

        {/* Hôpitaux non localisés */}
        {notLocatedHospitals.length > 0 && (
          <div className="p-4 border-t-8 border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Hôpitaux non localisés ({notLocatedHospitals.length})
              </h4>
            </div>
            <div className="space-y-3">
              {notLocatedHospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  className={`bg-white dark:bg-slate-800 rounded-xl p-4 border-2 transition-all ${
                    selectedId === hospital.id
                      ? "border-blue-500 shadow-md"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h5 className="font-semibold text-slate-900 dark:text-slate-100">
                      {hospital.nom}
                    </h5>
                    <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full shrink-0">
                      Non localisé
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {hospital.type_hopital_nom}
                  </p>

                  {/* Adresse */}
                  <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 mb-1">
                    <MapPinIcon className="w-3 h-3 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{hospital.adresse}</span>
                  </div>

                  {/* Téléphone */}
                  {hospital.telephone && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-3">
                      <PhoneIcon className="w-3 h-3 shrink-0" />
                      <span>{hospital.telephone}</span>
                    </div>
                  )}

                  <button
                    onClick={() => onShowDetails(hospital.id)}
                    className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Voir les détails
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
