import api from "./api";

export interface PlateauTechnique {
  id: number;
  nom: string;
}

export interface HopitalLight {
  id: number;
  nom: string;
  type_hopital_nom: string;
}

export interface HopitalPlateauTechnique {
  id: number;
  hopital: number;
  hopital_nom: string;
  plateau_technique: number;
  plateau_technique_nom: string;
}

export interface PaginatedHopitaux {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: HopitalLight[];
}

export interface HopitalPlateaux {
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
  plateaux: HopitalPlateauTechnique[];
}

export const plateauTechniqueAPI = {
  getAll: () => api.get<PlateauTechnique[]>("/plateau-technique/"),
  getById: (id: number) => api.get<PlateauTechnique>(`/plateau-technique/${id}/`),
  create: (data: { nom: string }) =>
    api.post<PlateauTechnique>("/plateau-technique/", data),
  update: (id: number, data: { nom: string }) =>
    api.put<PlateauTechnique>(`/plateau-technique/${id}/`, data),
  delete: (id: number) => api.delete(`/plateau-technique/${id}/`),

  getHopitaux: (params?: { search?: string; page?: number; page_size?: number }) =>
    api.get<PaginatedHopitaux>("/plateau-technique/hopitaux/", { params }),

  getAssociations: (hopitalId: number) =>
    api.get<HopitalPlateaux>(`/plateau-technique/associations/${hopitalId}/`),

  bulkSetAssociations: (hopitalId: number, plateauIds: number[]) =>
    api.post(`/plateau-technique/associations/${hopitalId}/bulk/`, {
      plateaux: plateauIds,
    }),

  deleteAssociation: (hopitalId: number, plateauId: number) =>
    api.delete(`/plateau-technique/associations/${hopitalId}/${plateauId}/`),

  exportExcel: (hopitalId: number) => {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const token = localStorage.getItem("access_token");
    return fetch(`${API_BASE_URL}/plateau-technique/export/${hopitalId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
