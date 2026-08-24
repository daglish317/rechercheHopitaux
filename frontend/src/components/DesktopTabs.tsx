"use client";

import { MapIcon, NavigationIcon, ListIcon } from "@/components/Icons";

export type ViewMode = "map" | "nearby" | "list";

interface DesktopTabsProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  locatedCount: number;
  totalCount: number;
  hasUserLocation: boolean;
}

export default function DesktopTabs({
  activeView,
  onViewChange,
  locatedCount,
  totalCount,
  hasUserLocation,
}: DesktopTabsProps) {
  const buttonClass = (view: ViewMode) =>
    `flex items-center gap-3 px-4 py-3 w-full text-left transition-colors relative ${
      activeView === view
        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-600"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-l-4 border-transparent"
    }`;

  return (
    <div className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Affichage
        </h3>
      </div>

      <div className="flex-1 py-2">
        <button
          onClick={() => onViewChange("map")}
          className={buttonClass("map")}
          disabled={locatedCount === 0}
        >
          <MapIcon className="w-5 h-5 shrink-0" />
          <div className="flex-1">
            <div className="font-medium text-sm">Vue Carte</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {locatedCount} hôpitaux
            </div>
          </div>
        </button>

        <button
          onClick={() => onViewChange("nearby")}
          className={buttonClass("nearby")}
          disabled={!hasUserLocation}
        >
          <NavigationIcon className="w-5 h-5 shrink-0" />
          <div className="flex-1">
            <div className="font-medium text-sm flex items-center gap-2">
              Proche de moi
              {!hasUserLocation && (
                <svg
                  className="w-3 h-3 text-slate-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {hasUserLocation ? "Triés par distance" : "Activez la position"}
            </div>
          </div>
        </button>

        <button
          onClick={() => onViewChange("list")}
          className={buttonClass("list")}
        >
          <ListIcon className="w-5 h-5 shrink-0" />
          <div className="flex-1">
            <div className="font-medium text-sm">Liste complète</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {totalCount} résultats
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
