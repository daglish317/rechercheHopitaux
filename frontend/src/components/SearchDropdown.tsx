"use client";

import { SearchHistoryItem } from "@/lib/searchHistory";
import { SearchSuggestion } from "@/lib/public";
import { ClockIcon, XIcon } from "./Icons";

interface SearchDropdownProps {
  history: SearchHistoryItem[];
  suggestions: SearchSuggestion[];
  loading: boolean;
  onSelectHistory: (text: string) => void;
  onSelectSuggestion: (text: string) => void;
  onRemoveHistory: (text: string) => void;
  onClearHistory: () => void;
  showHistory: boolean;
}

export default function SearchDropdown({
  history,
  suggestions,
  loading,
  onSelectHistory,
  onSelectSuggestion,
  onRemoveHistory,
  onClearHistory,
  showHistory,
}: SearchDropdownProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "maladie":
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "examen":
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case "plateau":
        return (
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case "hopital":
        return (
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "maladie":
        return "Maladie";
      case "examen":
        return "Examen";
      case "plateau":
        return "Plateau technique";
      case "hopital":
        return "Hôpital";
      default:
        return "";
    }
  };

  if (showHistory && history.length === 0 && suggestions.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-h-[400px] overflow-y-auto z-[1000]">
      {/* Historique */}
      {showHistory && history.length > 0 && (
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Recherches récentes
            </span>
            <button
              onClick={onClearHistory}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Tout effacer
            </button>
          </div>
          <div className="pb-2">
            {history.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer group"
              >
                <ClockIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <button
                  onClick={() => onSelectHistory(item.text)}
                  className="flex-1 text-left text-sm text-slate-700 dark:text-slate-300"
                >
                  {item.text}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveHistory(item.text);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                  aria-label="Supprimer"
                >
                  <XIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div>
          {showHistory && history.length > 0 && (
            <div className="px-4 py-2.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Suggestions
              </span>
            </div>
          )}
          <div className={showHistory && history.length > 0 ? "" : "py-2"}>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSelectSuggestion(suggestion.text)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left transition-colors"
              >
                {getIcon(suggestion.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-300 truncate">
                    {suggestion.text}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {getTypeLabel(suggestion.type)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="px-4 py-8 text-center">
          <div className="inline-block w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Recherche en cours...
          </p>
        </div>
      )}

      {/* Aucun résultat */}
      {!loading && !showHistory && suggestions.length === 0 && (
        <div className="px-4 py-8 text-center">
          <svg className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Aucune suggestion trouvée
          </p>
        </div>
      )}
    </div>
  );
}
