"use client";

import { MapIcon, NavigationIcon, ListIcon } from "@/components/Icons";

export type ViewMode = "map" | "nearby" | "list";

interface MobileNavigationProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  locatedCount: number;
  totalCount: number;
  hasUserLocation: boolean;
}

export default function MobileNavigation({
  activeView,
  onViewChange,
  locatedCount,
  totalCount,
  hasUserLocation,
}: MobileNavigationProps) {
  const buttonClass = (view: ViewMode) =>
    `flex flex-col items-center justify-center gap-1 py-3 px-4 relative transition-colors ${
      activeView === view
        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
    }`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-2xl md:hidden">
      <div className="grid grid-cols-3 gap-0">
        <button
          onClick={() => onViewChange("map")}
          className={buttonClass("map")}
          disabled={locatedCount === 0}
        >
          <MapIcon className="w-5 h-5" />
          <span className="text-xs font-medium">Carte</span>
          {locatedCount > 0 && (
            <span className="absolute top-1 right-1/4 bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {locatedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onViewChange("nearby")}
          className={buttonClass("nearby")}
          disabled={!hasUserLocation}
        >
          <NavigationIcon className="w-5 h-5" />
          <span className="text-xs font-medium">Proche</span>
          {!hasUserLocation && (
            <svg
              className="w-3 h-3 absolute top-1 right-1/4 text-slate-400"
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
        </button>

        <button
          onClick={() => onViewChange("list")}
          className={buttonClass("list")}
        >
          <ListIcon className="w-5 h-5" />
          <span className="text-xs font-medium">Liste</span>
          {totalCount > 0 && (
            <span className="absolute top-1 right-1/4 bg-emerald-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
