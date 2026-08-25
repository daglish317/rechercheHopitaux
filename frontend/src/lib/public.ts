import api from "./api";

export interface HopitalSearchResult {
  id: number;
  nom: string;
  type_hopital_nom: string;
  adresse: string;
  telephone: string;
  latitude: string | null;
  longitude: string | null;
  distance_km: number | null;
  distance_text: string | null;
  matched_maladies: string[];
  matched_examens: string[];
  matched_plateaux: string[];
}

export interface SearchResponse {
  located: HopitalSearchResult[];
  not_located: HopitalSearchResult[];
  user_position: {
    lat: number;
    lon: number;
  } | null;
}

export interface HopitalDetail {
  id: number;
  nom: string;
  type_hopital: number;
  type_hopital_nom: string;
  adresse: string;
  telephone: string;
  latitude: string | null;
  longitude: string | null;
  maladies: string[];
  examens: string[];
  plateaux_techniques: string[];
}

export const publicAPI = {
  search: (
    query: string,
    lat?: number | null,
    lon?: number | null,
    radius?: number | null
  ) => {
    const params: Record<string, string | number> = { q: query };
    if (lat !== null && lat !== undefined) params.lat = lat;
    if (lon !== null && lon !== undefined) params.lon = lon;
    if (radius !== null && radius !== undefined) params.radius = radius;
    
    return api.get<SearchResponse>("/search/", { params });
  },
  getHopitalDetail: (id: number) =>
    api.get<HopitalDetail>(`/search/hopitaux/${id}/`),
};
