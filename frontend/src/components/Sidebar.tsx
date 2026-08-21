"use client";

import Link from "next/link";
import { HopitalSearchResult } from "@/lib/public";

interface SidebarProps {
  results: HopitalSearchResult[];
  selectedId: number | null;
  onSelect: (hospital: HopitalSearchResult) => void;
  loading: boolean;
  hasSearched: boolean;
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
      <div className="w-1/3 border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-4">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="w-1/3 border-r border-gray-200 bg-white flex items-center justify-center">
        <div className="text-center text-gray-400 px-6">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-sm">
            Recherchez un hôpital par nom, spécialité, examen ou plateau technique
          </p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="w-1/3 border-r border-gray-200 bg-white flex items-center justify-center">
        <div className="text-center text-gray-500 px-6">
          <p className="text-sm">
            Aucun hôpital ne correspond à votre recherche.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-1/3 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-3">
          {results.length} résultat{results.length > 1 ? "s" : ""}
        </p>
        <div className="space-y-3">
          {results.map((hopital) => (
            <div
              key={hopital.id}
              onClick={() => onSelect(hopital)}
              className={`bg-gray-50 rounded-lg p-4 cursor-pointer transition-all hover:bg-blue-50 hover:border-blue-200 border border-transparent ${
                selectedId === hopital.id
                  ? "bg-blue-50 border-blue-400 ring-1 ring-blue-200"
                  : ""
              }`}
            >
              <h3 className="font-semibold text-gray-900 text-sm">{hopital.nom}</h3>
              <p className="text-xs text-gray-500 mt-1">{hopital.type_hopital_nom}</p>
              <p className="text-xs text-gray-600 mt-1">{hopital.adresse}</p>
              {hopital.telephone && (
                <p className="text-xs text-gray-500 mt-1">{hopital.telephone}</p>
              )}
              <Link
                href={`/hopital/${hopital.id}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Voir les détails
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
