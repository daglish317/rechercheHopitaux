"use client";

import { useEffect, useRef } from "react";
import { HopitalSearchResult } from "@/lib/public";
import { calculateRoute } from "@/lib/routing";

interface HospitalMapProps {
  hospitals: HopitalSearchResult[];
  selectedId: number | null;
  onSelect: (hospital: HopitalSearchResult) => void;
  userPosition: [number, number] | null;
  centerOnUser: boolean;
}

export default function HospitalMap({
  hospitals,
  selectedId,
  onSelect,
  userPosition,
  centerOnUser,
}: HospitalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const routeRef = useRef<unknown>(null);
  const userMarkerRef = useRef<unknown>(null);
  const centeredRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const leaflet = await import("leaflet");
      const L = leaflet.default;
      if (!L) return;

      if (!mapRef.current || cancelled) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current, {
          center: [-4.0383, 21.7587],
          zoom: 6,
          zoomControl: true,
          minZoom: 2,
          maxZoom: 19,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      if (cancelled) return;

      const map = mapInstanceRef.current as ReturnType<typeof L.map>;
      if (!map) return;

      if (userPosition && !centeredRef.current) {
        centeredRef.current = true;
        map.setView(userPosition, 14);

        const userIcon = L.divIcon({
          className: "user-marker",
          html: `<div style="width:20px;height:20px;background:#22c55e;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        userMarkerRef.current = L.marker(userPosition, { icon: userIcon }).addTo(map);
      }

      if (centerOnUser && userPosition) {
        map.setView(userPosition, Math.max(map.getZoom(), 14));
      }

      markersRef.current.forEach((marker) => {
        (marker as ReturnType<typeof L.marker>).remove();
      });
      markersRef.current = [];

      if (routeRef.current) {
        (routeRef.current as { remove: () => void }).remove();
        routeRef.current = null;
      }

      hospitals.forEach((hopital) => {
        if (!hopital.latitude || !hopital.longitude) return;

        const lat = parseFloat(hopital.latitude);
        const lng = parseFloat(hopital.longitude);

        if (isNaN(lat) || isNaN(lng)) return;

        const isSelected = hopital.id === selectedId;

        const defaultIcon = L.divIcon({
          className: "custom-marker",
          html: `<div style="width:24px;height:24px;background:#3b82f6;border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><div style="width:8px;height:8px;background:white;border-radius:50%"></div></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const selectedIcon = L.divIcon({
          className: "custom-marker-selected",
          html: `<div style="width:32px;height:32px;background:#1d4ed8;border:3px solid white;border-radius:50%;box-shadow:0 3px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center"><div style="width:10px;height:10px;background:white;border-radius:50%"></div></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([lat, lng], {
          icon: isSelected ? selectedIcon : defaultIcon,
        }).addTo(map);

        marker.on("click", () => {
          onSelect(hopital);
        });

        markersRef.current.push(marker);
      });

      if (selectedId) {
        const selected = hospitals.find((h) => h.id === selectedId);
        if (selected && selected.latitude && selected.longitude) {
          const lat = parseFloat(selected.latitude);
          const lng = parseFloat(selected.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            map.setView([lat, lng], Math.max(map.getZoom(), 14));
          }

          if (userPosition) {
            const coords = await calculateRoute(userPosition, selected);
            if (coords && !cancelled) {
              routeRef.current = L.polyline(coords, {
                color: "#3b82f6",
                weight: 5,
                opacity: 0.7,
              }).addTo(map);

              const allCoords = [
                userPosition,
                [lat, lng] as [number, number],
                ...coords,
              ];
              const routeBounds = L.latLngBounds(allCoords);
              map.fitBounds(routeBounds, { padding: [50, 50] });
            }
          }
        }
      } else if (hospitals.length > 0 && !selectedId && centeredRef.current) {
        const bounds = L.latLngBounds([]);
        let hasCoords = false;
        hospitals.forEach((h) => {
          if (h.latitude && h.longitude) {
            const lat = parseFloat(h.latitude);
            const lng = parseFloat(h.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
              bounds.extend([lat, lng]);
              hasCoords = true;
            }
          }
        });
        if (hasCoords) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [hospitals, selectedId, onSelect, userPosition, centerOnUser]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return <div ref={mapRef} className="w-full h-full" />;
}
