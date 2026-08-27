"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import SimpleHeader from "@/components/SimpleHeader";
import { publicAPI, HopitalDetail } from "@/lib/public";
import {
  MapPinIcon,
  PhoneIcon,
  HospitalIcon,
  ArrowLeftIcon,
  SearchIcon,
} from "@/components/Icons";

type FilterType = "all" | "maladies" | "examens" | "plateaux";

export default function HopitalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [hopital, setHopital] = useState<HopitalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const id = params?.id ? Number(params.id) : null;

  const fetchHopital = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError("");
    try {
      const response = await publicAPI.getHopitalDetail(id);
      console.log("Hopital data received:", response.data);
      setHopital(response.data);
    } catch (err: any) {
      console.error("Error fetching hopital:", err);
      console.error("Error response:", err.response);
      const message = err.response?.data?.detail || err.response?.data?.message || err.message || "Hôpital non trouvé.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const load = async () => {
      await fetchHopital();
    };
    load();
  }, [fetchHopital]);

  // Filtrage des données
  const filteredData = useMemo(() => {
    if (!hopital) return { maladies: [], examens: [], plateaux: [] };

    const query = searchQuery.toLowerCase().trim();

    const filterItems = (items: string[]) => {
      if (!query) return items;
      return items.filter(item => item.toLowerCase().includes(query));
    };

    return {
      maladies: filterItems(hopital.maladies),
      examens: filterItems(hopital.examens),
      plateaux: filterItems(hopital.plateaux_techniques),
    };
  }, [hopital, searchQuery]);

  // Compter les résultats
  const resultCount = useMemo(() => {
    let count = 0;
    if (activeFilter === "all" || activeFilter === "maladies") count += filteredData.maladies.length;
    if (activeFilter === "all" || activeFilter === "examens") count += filteredData.examens.length;
    if (activeFilter === "all" || activeFilter === "plateaux") count += filteredData.plateaux.length;
    return count;
  }, [filteredData, activeFilter]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        <SimpleHeader />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
              <div className="space-y-4 bg-white dark:bg-slate-800 rounded-xl p-6">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !hopital) {
    return (
      <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        <SimpleHeader />
        <div className="flex-1 overflow-y-auto flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <HospitalIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Hôpital non trouvé
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {error || "Désolé, nous n'avons pas pu trouver cet hôpital."}
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Retour à la recherche
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <SimpleHeader />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {/* Bouton retour */}
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 font-medium transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Retour à la recherche
          </button>

          {/* Carte principale - Informations générales */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 mb-6 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <HospitalIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {hopital.nom}
                </h1>
                <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded-full">
                  {hopital.type_hopital_nom}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Adresse */}
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Adresse
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    {hopital.adresse}
                  </p>
                </div>
              </div>

              {/* Téléphone */}
              {hopital.telephone && (
                <div className="flex items-start gap-3">
                  <PhoneIcon className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Téléphone
                    </p>
                    <a
                      href={`tel:${hopital.telephone}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {hopital.telephone}
                    </a>
                  </div>
                </div>
              )}

              {/* Localisation GPS */}
              {hopital.latitude && hopital.longitude && (
                <div className="flex items-start gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <svg
                    className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Coordonnées GPS
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Lat: {hopital.latitude}, Lon: {hopital.longitude}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${hopital.latitude},${hopital.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
                    >
                      Voir sur Google Maps
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          {(hopital.maladies.length > 0 || hopital.examens.length > 0 || hopital.plateaux_techniques.length > 0) && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 md:p-6 mb-6 shadow-sm">
              {/* Barre de recherche */}
              <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher une maladie, un examen ou un équipement..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Filtres */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  Tout ({hopital.maladies.length + hopital.examens.length + hopital.plateaux_techniques.length})
                </button>
                {hopital.maladies.length > 0 && (
                  <button
                    onClick={() => setActiveFilter("maladies")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === "maladies"
                        ? "bg-red-600 text-white"
                        : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50"
                    }`}
                  >
                    Maladies ({hopital.maladies.length})
                  </button>
                )}
                {hopital.examens.length > 0 && (
                  <button
                    onClick={() => setActiveFilter("examens")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === "examens"
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50"
                    }`}
                  >
                    Examens ({hopital.examens.length})
                  </button>
                )}
                {hopital.plateaux_techniques.length > 0 && (
                  <button
                    onClick={() => setActiveFilter("plateaux")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === "plateaux"
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50"
                    }`}
                  >
                    Plateaux techniques ({hopital.plateaux_techniques.length})
                  </button>
                )}
              </div>

              {/* Compteur de résultats */}
              {searchQuery && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>{resultCount}</strong> résultat{resultCount > 1 ? "s" : ""} trouvé{resultCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          {/* Maladies prises en charge */}
          {(activeFilter === "all" || activeFilter === "maladies") && filteredData.maladies.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Maladies prises en charge
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {filteredData.maladies.length} maladie{filteredData.maladies.length > 1 ? "s" : ""}
                    {searchQuery && ` trouvée${filteredData.maladies.length > 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {filteredData.maladies.map((maladie, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1.5 text-sm bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-lg font-medium"
                  >
                    {maladie}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Examens médicaux */}
          {(activeFilter === "all" || activeFilter === "examens") && filteredData.examens.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Examens médicaux disponibles
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {filteredData.examens.length} examen{filteredData.examens.length > 1 ? "s" : ""}
                    {searchQuery && ` trouvé${filteredData.examens.length > 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {filteredData.examens.map((examen, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded-lg font-medium"
                  >
                    {examen}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Plateau technique */}
          {(activeFilter === "all" || activeFilter === "plateaux") && filteredData.plateaux.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Plateau technique
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {filteredData.plateaux.length} équipement{filteredData.plateaux.length > 1 ? "s" : ""}
                    {searchQuery && ` trouvé${filteredData.plateaux.length > 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {filteredData.plateaux.map((plateau, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1.5 text-sm bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-lg font-medium"
                  >
                    {plateau}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Message si aucun résultat avec la recherche */}
          {searchQuery && resultCount === 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center mb-6">
              <svg className="w-12 h-12 text-amber-500 dark:text-amber-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-amber-800 dark:text-amber-300 font-medium mb-1">
                Aucun résultat
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Aucun élément ne correspond à votre recherche &quot;{searchQuery}&quot;
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                Réinitialiser la recherche
              </button>
            </div>
          )}

          {/* Message si aucune information supplémentaire */}
          {hopital.maladies.length === 0 &&
            hopital.examens.length === 0 &&
            hopital.plateaux_techniques.length === 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
                <svg className="w-12 h-12 text-amber-500 dark:text-amber-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-amber-800 dark:text-amber-300 font-medium mb-1">
                  Informations limitées
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Les détails sur les services de cet hôpital ne sont pas encore disponibles.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
