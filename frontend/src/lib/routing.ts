import { HopitalSearchResult } from "./public";

export async function calculateRoute(
  userPosition: [number, number],
  hospital: HopitalSearchResult
): Promise<[number, number][] | null> {
  if (!hospital.latitude || !hospital.longitude) return null;

  const lat = parseFloat(hospital.latitude);
  const lng = parseFloat(hospital.longitude);

  if (isNaN(lat) || isNaN(lng)) return null;

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${userPosition[1]},${userPosition[0]};${lng},${lat}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      return data.routes[0].geometry.coordinates.map(
        (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
      );
    }
    return null;
  } catch {
    return null;
  }
}
