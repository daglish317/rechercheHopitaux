"use client";

import HospitalMap from "@/components/HospitalMap";
import { HopitalSearchResult } from "@/lib/public";
import { AlertIcon } from "@/components/Icons";

interface MapViewProps {
  hospitals: HopitalSearchResult[];
  notLocatedCount: number;
  selectedId: number | null;
  onSelect: (hospital: HopitalSearchResult) => void;
  userPosition: [number, number] | null;
  onShowNotLocated?: () => void;
}

export default function MapView({
  hospitals,
  notLocatedCount,
  selectedId,
  onSelect,
  userPosition,
  onShowNotLocated,
}: MapViewProps) {
  if (hospitals.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl">
        <div className="text-center px-6 max-w-md">
          <AlertIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Aucun hôpital localisé
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Les hôpitaux correspondant à votre recherche n&apos;ont pas de
            coordonnées GPS enregistrées.
          </p>
          {notLocatedCount > 0 && onShowNotLocated && (
            <button
              onClick={onShowNotLocated}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Voir les {notLocatedCount} hôpitaux en liste
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {notLocatedCount > 0 && (
        <div className="px-4 py-3 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
            <AlertIcon className="w-4 h-4 shrink-0" />
            <span>
              <strong>{notLocatedCount}</strong> hôpitaux sans localisation
            </span>
          </div>
          {onShowNotLocated && (
            <button
              onClick={onShowNotLocated}
              className="text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline shrink-0"
            >
              Voir la liste →
            </button>
          )}
        </div>
      )}

      <div className="flex-1 min-h-0">
        <HospitalMap
          hospitals={hospitals}
          selectedId={selectedId}
          onSelect={onSelect}
          userPosition={userPosition}
          centerOnUser={false}
        />
      </div>
    </div>
  );
}
