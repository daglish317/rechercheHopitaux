import api from "./api";

export interface Maladie {
  id: number;
  nom: string;
}

export interface HopitalLight {
  id: number;
  nom: string;
  type_hopital_nom: string;
}

export interface PriseEnCharge {
  id: number;
  hopital: number;
  hopital_nom: string;
  maladie: number;
  maladie_nom: string;
}

export interface PaginatedHopitaux {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: HopitalLight[];
}

export interface HopitalMaladies {
  hopital: {
    id: number;
    nom: string;
    type_hopital_nom: string;
    adresse: string;
    telephone: string;
    latitude: string | null;
    longitude: string | null;
    statut: string;
  };
  maladies: PriseEnCharge[];
}

export const maladieAPI = {
  getAll: () => api.get<Maladie[]>("/maladies/"),
  create: (data: { nom: string }) => api.post<Maladie>("/maladies/", data),
  update: (id: number, data: { nom: string }) =>
    api.put<Maladie>(`/maladies/${id}/`, data),
  delete: (id: number) => api.delete(`/maladies/${id}/`),

  getHopitaux: (params?: { search?: string; page?: number; page_size?: number }) =>
    api.get<PaginatedHopitaux>("/maladies/hopitaux/", { params }),

  getAssociations: (hopitalId: number) =>
    api.get<HopitalMaladies>(`/maladies/associations/${hopitalId}/`),

  bulkSetAssociations: (hopitalId: number, maladieIds: number[]) =>
    api.post(`/maladies/associations/${hopitalId}/bulk/`, {
      maladies: maladieIds,
    }),

  deleteAssociation: (hopitalId: number, maladieId: number) =>
    api.delete(`/maladies/associations/${hopitalId}/${maladieId}/`),

  exportExcel: (hopitalId: number) => {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const token = localStorage.getItem("access_token");
    return fetch(`${API_BASE_URL}/maladies/export/${hopitalId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
