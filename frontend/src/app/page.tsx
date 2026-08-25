"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import PublicHeader from "@/components/PublicHeader";
import MobileNavigation from "@/components/MobileNavigation";
import DesktopTabs from "@/components/DesktopTabs";
import MapView from "@/components/views/MapView";
import NearbyView from "@/components/views/NearbyView";
import ListView from "@/components/views/ListView";
import HospitalDetailModal from "@/components/HospitalDetailModal";
import { publicAPI, HopitalSearchResult, SearchResponse } from "@/lib/public";

export type ViewMode = "map" | "nearby" | "list";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [allHospitals, setAllHospitals] = useState<HopitalSearchResult[]>([]);
  const [locatedHospitals, setLocatedHospitals] = useState<HopitalSearchResult[]>([]);
  const [notLocatedHospitals, setNotLocatedHospitals] = useState<HopitalSearchResult[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailModalId, setDetailModalId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [activeView, setActiveView] = useState<ViewMode>("map");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Charger tous les hôpitaux au démarrage
  useEffect(() => {
    const loadAllHospitals = async () => {
      setLoading(true);
      try {
        const response = await publicAPI.search("", null, null, null);
        setAllHospitals([...response.data.located, ...response.data.not_located]);
        setLocatedHospitals(response.data.located);
        setNotLocatedHospitals(response.data.not_located);
      } catch (error) {
        console.error("Erreur lors du chargement des hôpitaux:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAllHospitals();
  }, []);

  // Détecter la position de l'utilisateur au chargement
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserPosition(pos);
          
          // Recalculer les distances si on a déjà chargé les hôpitaux
          if (allHospitals.length > 0) {
            performSearch(searchQuery, pos[0], pos[1]);
          }
        },
        () => {
          // Erreur silencieuse, l'utilisateur peut activer manuellement
        }
      );
    }
  }, []);

  const handleLocateMe = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserPosition(pos);
          
          // Si on a déjà des résultats, relancer la recherche avec la position
          if (searchQuery.trim() && hasSearched) {
            performSearch(searchQuery, pos[0], pos[1]);
          }
          
          // Basculer vers la vue "Proche" si on vient de l'activer
          if (locatedHospitals.length > 0) {
            setActiveView("nearby");
          }
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
        }
      );
    }
  }, [searchQuery, hasSearched, locatedHospitals.length]);

  const performSearch = useCallback(
    async (query: string, lat?: number, lon?: number) => {
      const searchLat = lat !== undefined ? lat : userPosition?.[0];
      const searchLon = lon !== undefined ? lon : userPosition?.[1];
      
      // Si pas de recherche, afficher tous les hôpitaux
      if (!query.trim()) {
        setLoading(true);
        setHasSearched(false);
        try {
          const response = await publicAPI.search("", searchLat, searchLon, null);
          setAllHospitals([...response.data.located, ...response.data.not_located]);
          setLocatedHospitals(response.data.located);
          setNotLocatedHospitals(response.data.not_located);
          setSelectedId(null);
        } catch (error) {
          console.error("Erreur:", error);
        } finally {
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setHasSearched(true);
      
      try {
        const response = await publicAPI.search(
          query,
          searchLat,
          searchLon,
          null
        );
        
        setAllHospitals([...response.data.located, ...response.data.not_located]);
        setLocatedHospitals(response.data.located);
        setNotLocatedHospitals(response.data.not_located);
        setSelectedId(null);
        
        // Choisir automatiquement la meilleure vue
        if (response.data.located.length > 0) {
          setActiveView("map");
        } else if (response.data.not_located.length > 0) {
          setActiveView("list");
        }
      } catch (error) {
        console.error("Erreur de recherche:", error);
        setLocatedHospitals([]);
        setNotLocatedHospitals([]);
      } finally {
        setLoading(false);
      }
    },
    [userPosition]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        performSearch(value);
      }, 400);
    },
    [performSearch]
  );

  const handleSelect = useCallback((hospital: HopitalSearchResult) => {
    setSelectedId(hospital.id);
  }, []);

  const handleShowDetails = useCallback((hospitalId: number) => {
    setDetailModalId(hospitalId);
  }, []);

  const handleViewChange = useCallback((view: ViewMode) => {
    setActiveView(view);
  }, []);

  const totalCount = locatedHospitals.length + notLocatedHospitals.length;
  const displayHospitals = [...locatedHospitals, ...notLocatedHospitals];

  return (
    <div className="h-screen flex flex-col app-shell-bg overflow-hidden">
      <PublicHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onLocateMe={handleLocateMe}
        hasPosition={userPosition !== null}
        resultCount={totalCount}
        hasSearched={hasSearched}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <section className="mx-auto w-full max-w-[1680px] flex-1 flex flex-col min-h-0 px-3 py-2 sm:px-5 lg:px-7">
          <div className="flex h-full gap-4">
            {/* Desktop Tabs */}
            <DesktopTabs
              activeView={activeView}
              onViewChange={handleViewChange}
              locatedCount={locatedHospitals.length}
              totalCount={totalCount}
              hasUserLocation={userPosition !== null}
            />

            {/* Contenu principal */}
            <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-teal-100 bg-white shadow-xl shadow-teal-900/10 overflow-hidden mb-16 md:mb-0">
              {/* Bandeau de recherche */}
              {hasSearched && searchQuery && (
                <div className="px-4 py-3 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800 shrink-0">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Résultats pour <strong>&quot;{searchQuery}&quot;</strong> :{" "}
                    <strong>{totalCount}</strong> {totalCount > 1 ? "hôpitaux trouvés" : "hôpital trouvé"}
                  </p>
                </div>
              )}

              <div className="flex-1 min-h-0 overflow-hidden">{loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">
                      {hasSearched ? "Recherche en cours..." : "Chargement de la carte..."}
                    </p>
                  </div>
                </div>
              ) : activeView === "map" ? (
                <MapView
                  hospitals={locatedHospitals}
                  notLocatedCount={notLocatedHospitals.length}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                  userPosition={userPosition}
                  onShowNotLocated={() => setActiveView("list")}
                />
              ) : activeView === "nearby" ? (
                <NearbyView
                  locatedHospitals={locatedHospitals}
                  notLocatedHospitals={notLocatedHospitals}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                  onShowDetails={handleShowDetails}
                  userPosition={userPosition}
                />
              ) : (
                <ListView
                  hospitals={displayHospitals}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                  onShowDetails={handleShowDetails}
                  hasUserPosition={userPosition !== null}
                />
              )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation
        activeView={activeView}
        onViewChange={handleViewChange}
        locatedCount={locatedHospitals.length}
        totalCount={totalCount}
        hasUserLocation={userPosition !== null}
      />

      {/* Modal de détails */}
      {detailModalId && (
        <HospitalDetailModal
          hospitalId={detailModalId}
          onClose={() => setDetailModalId(null)}
        />
      )}
    </div>
  );
}
