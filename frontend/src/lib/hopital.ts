import api from "./api";

export interface Hopital {
  id: number;
  nom: string;
  type_hopital: number;
  type_hopital_nom: string;
  adresse: string;
  telephone: string;
  latitude: string;
  longitude: string;
  statut: "ACTIF" | "INACTIF";
}

export interface HopitalCreateData {
  nom: string;
  type_hopital: number;
  adresse: string;
  telephone?: string;
  latitude: number;
  longitude: number;
  statut: "ACTIF" | "INACTIF";
}

export const hopitalAPI = {
  getAll: () => api.get<Hopital[]>("/hopitaux/"),
  getById: (id: number) => api.get<Hopital>(`/hopitaux/${id}/`),
  create: (data: HopitalCreateData) => api.post<Hopital>("/hopitaux/", data),
  update: (id: number, data: HopitalCreateData) =>
    api.put<Hopital>(`/hopitaux/${id}/`, data),
  updateStatut: (id: number, statut: "ACTIF" | "INACTIF") =>
    api.patch<Hopital>(`/hopitaux/${id}/statut/`, { statut }),
};
