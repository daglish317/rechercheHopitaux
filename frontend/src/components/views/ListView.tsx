"use client";

import { HopitalSearchResult } from "@/lib/public";
import {
  MapPinIcon,
  PhoneIcon,
  HospitalIcon,
  NavigationIcon,
} from "@/components/Icons";
import MatchedItems from "@/components/MatchedItems";

interface ListViewProps {
  hospitals: HopitalSearchResult[];
  selectedId: number | null;
  onSelect: (hospital: HopitalSearchResult) => void;
  onShowDetails: (hospitalId: number) => void;
  hasUserPosition: boolean;
}

export default function ListView({
  hospitals,
  selectedId,
  onSelect,
  onShowDetails,
  hasUserPosition,
}: ListViewProps) {
  if (hospitals.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-6">
        <div className="text-center max-w-md">
          <HospitalIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Aucun résultat
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Aucun hôpital ne correspond à votre recherche.
          </p>
        </div>
      </div>
    );
  }

  // Séparer les hôpitaux localisés et non localisés
  const located = hospitals.filter((h) => h.latitude && h.longitude);
  const notLocated = hospitals.filter((h) => !h.latitude || !h.longitude);

  // Trier les localisés par distance si disponible
  const sortedLocated = hasUserPosition
    ? [...located].sort(
        (a, b) => (a.distance_km || Infinity) - (b.distance_km || Infinity)
      )
    : located;

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* En-tête */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Tous les résultats
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                {hospitals.length} hôpitaux trouvés
              </p>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-slate-600 dark:text-slate-400">
                  {located.length} localisés
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <span className="text-slate-600 dark:text-slate-400">
                  {notLocated.length} non localisés
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hôpitaux localisés */}
        {sortedLocated.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Hôpitaux localisés ({sortedLocated.length})
              </h4>
            </div>
            <div className="space-y-3">
              {sortedLocated.map((hospital) => (
                <div
                  key={hospital.id}
                  className={`bg-white dark:bg-slate-800 rounded-xl p-5 border-2 transition-all ${
                    selectedId === hospital.id
                      ? "border-blue-500 shadow-lg ring-2 ring-blue-200 dark:ring-blue-900"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h5 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">
                        {hospital.nom}
                      </h5>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {hospital.type_hopital_nom}
                      </p>
                    </div>
                    {hasUserPosition && hospital.distance_text && (
                      <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 rounded-full shrink-0">
                        <NavigationIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {hospital.distance_text}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    {/* Adresse */}
                    <div className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                      <MapPinIcon className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                      <span>{hospital.adresse}</span>
                    </div>

                    {/* Téléphone */}
                    {hospital.telephone && (
                      <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                        <PhoneIcon className="w-4 h-4 shrink-0 text-slate-400" />
                        <span>{hospital.telephone}</span>
                      </div>
                    )}
                  </div>

                  <MatchedItems
                    maladies={hospital.matched_maladies}
                    examens={hospital.matched_examens}
                    plateaux={hospital.matched_plateaux}
                  />

                  <button
                    onClick={() => onShowDetails(hospital.id)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Voir les détails
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hôpitaux non localisés */}
        {notLocated.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Hôpitaux non localisés ({notLocated.length})
              </h4>
            </div>
            <div className="space-y-3">
              {notLocated.map((hospital) => (
                <div
                  key={hospital.id}
                  className={`bg-white dark:bg-slate-800 rounded-xl p-5 border-2 transition-all ${
                    selectedId === hospital.id
                      ? "border-blue-500 shadow-lg ring-2 ring-blue-200 dark:ring-blue-900"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h5 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">
                        {hospital.nom}
                      </h5>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {hospital.type_hopital_nom}
                      </p>
                    </div>
                    <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full shrink-0 font-medium">
                      Position non renseignée
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {/* Adresse */}
                    <div className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                      <MapPinIcon className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                      <span>{hospital.adresse}</span>
                    </div>

                    {/* Téléphone */}
                    {hospital.telephone && (
                      <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                        <PhoneIcon className="w-4 h-4 shrink-0 text-slate-400" />
                        <span>{hospital.telephone}</span>
                      </div>
                    )}
                  </div>

                  <MatchedItems
                    maladies={hospital.matched_maladies}
                    examens={hospital.matched_examens}
                    plateaux={hospital.matched_plateaux}
                  />

                  <button
                    onClick={() => onShowDetails(hospital.id)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
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
    </div>
  );
}
