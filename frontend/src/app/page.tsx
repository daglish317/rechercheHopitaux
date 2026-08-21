"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import PublicHeader from "@/components/PublicHeader";
import Sidebar from "@/components/Sidebar";
import HospitalMap from "@/components/HospitalMap";
import { publicAPI, HopitalSearchResult } from "@/lib/public";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<HopitalSearchResult[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [centerOnUser, setCenterOnUser] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition([position.coords.latitude, position.coords.longitude]);
        },
        () => {}
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
          setCenterOnUser(true);
          setTimeout(() => setCenterOnUser(false), 100);
        },
        () => {}
      );
    }
  }, []);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      setSelectedId(null);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await publicAPI.search(query);
      setResults(response.data);
      setSelectedId(null);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

  return (
    <div className="min-h-screen app-shell-bg flex flex-col">
      <PublicHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onLocateMe={handleLocateMe}
        hasPosition={userPosition !== null}
        resultCount={results.length}
        hasSearched={hasSearched}
      />

      <main className="h-[calc(100vh-80px)] overflow-hidden px-3 py-4 sm:px-5 lg:px-7">
        <section className="mx-auto grid h-full max-w-[1680px] grid-cols-1 gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
          <Sidebar
            results={results}
            selectedId={selectedId}
            onSelect={handleSelect}
            loading={loading}
            hasSearched={hasSearched}
          />

          <div className="relative h-full min-h-0 overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-xl shadow-teal-900/10">
            <HospitalMap
              hospitals={results}
              selectedId={selectedId}
              onSelect={handleSelect}
              userPosition={userPosition}
              centerOnUser={centerOnUser}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
