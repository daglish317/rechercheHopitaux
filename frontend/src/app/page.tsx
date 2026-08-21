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
        () => {
          // Geolocation denied, continue without it
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
          setCenterOnUser(true);
          setTimeout(() => setCenterOnUser(false), 100);
        },
        () => {
          // Geolocation denied
        }
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onLocateMe={handleLocateMe}
        hasPosition={userPosition !== null}
      />

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        <Sidebar
          results={results}
          selectedId={selectedId}
          onSelect={handleSelect}
          loading={loading}
          hasSearched={hasSearched}
        />

        <div className="flex-1 relative">
          <HospitalMap
            hospitals={results}
            selectedId={selectedId}
            onSelect={handleSelect}
            userPosition={userPosition}
            centerOnUser={centerOnUser}
          />
        </div>
      </div>
    </div>
  );
}
