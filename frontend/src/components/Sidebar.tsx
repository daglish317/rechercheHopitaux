"use client";

import Link from "next/link";
import { HopitalSearchResult } from "@/lib/public";
import { HospitalIcon, MapPinIcon, PhoneIcon, SearchIcon } from "@/components/Icons";

interface SidebarProps {
  results: HopitalSearchResult[];
  selectedId: number | null;
  onSelect: (hospital: HopitalSearchResult) => void;
  loading: boolean;
  hasSearched: boolean;
}

function EmptyState({ hasSearched }: { hasSearched: boolean }) {
  return (
    <div className="flex min-h-[260px] items-center justify-center px-6 text-center">
      <div className="max-w-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          <SearchIcon className="h-6 w-6" />
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {hasSearched
            ? "Aucun resultat."
            : "Utilisez la barre de recherche pour afficher les hopitaux."}
        </p>
      </div>
    </div>
  );
}

export default function Sidebar({
  results,
  selectedId,
  onSelect,
  loading,
  hasSearched,
}: SidebarProps) {
  if (loading) {
    return (
      <aside className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/70 bg-white/92 shadow-xl shadow-slate-200/70 dark:border-slate-700/80 dark:bg-slate-900/92 dark:shadow-black/20">
        <div className="space-y-3 p-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/70"
            >
              <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-3 h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-2 h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/70 bg-white/92 shadow-xl shadow-slate-200/70 dark:border-slate-700/80 dark:bg-slate-900/92 dark:shadow-black/20">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <h2 className="text-sm font-bold text-slate-950 dark:text-white">
          {hasSearched ? `${results.length} resultats` : "Resultats"}
        </h2>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/70 dark:text-teal-300">
          <HospitalIcon className="h-4 w-4" />
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState hasSearched={hasSearched} />
      ) : (
        <div className="max-h-[44vh] space-y-3 overflow-y-auto p-4 xl:max-h-none xl:h-[calc(100%-65px)]">
          {results.map((hopital) => {
            const isSelected = selectedId === hopital.id;
            return (
              <article
                key={hopital.id}
                onClick={() => onSelect(hopital)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isSelected
                    ? "border-teal-300 bg-teal-50 shadow-md shadow-teal-900/5 ring-2 ring-teal-500/15 dark:border-teal-800 dark:bg-teal-950/40"
                    : "border-slate-200 bg-white hover:border-teal-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-800"
                }`}
              >
                <h3 className="truncate text-sm font-bold text-slate-950 dark:text-white">
                  {hopital.nom}
                </h3>
                <p className="mt-1 text-xs font-medium text-teal-700 dark:text-teal-300">
                  {hopital.type_hopital_nom}
                </p>
                <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <p className="flex items-start gap-2">
                    <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <span>{hopital.adresse}</span>
                  </p>
                  {hopital.telephone && (
                    <p className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 shrink-0 text-slate-400" />
                      <span>{hopital.telephone}</span>
                    </p>
                  )}
                </div>
                <Link
                  href={`/hopital/${hopital.id}`}
                  onClick={(event) => event.stopPropagation()}
                  className="mt-4 inline-flex rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-200"
                >
                  Details
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </aside>
  );
}
