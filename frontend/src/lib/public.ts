import api from "./api";

export interface HopitalSearchResult {
  id: number;
  nom: string;
  type_hopital_nom: string;
  adresse: string;
  telephone: string;
  latitude: string | null;
  longitude: string | null;
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
  search: (query: string) =>
    api.get<HopitalSearchResult[]>("/search/", { params: { q: query } }),
  getHopitalDetail: (id: number) =>
    api.get<HopitalDetail>(`/hopitaux/${id}/`),
};
