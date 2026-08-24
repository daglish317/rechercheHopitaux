import api from "./api";

export interface ExamenMedical {
  id: number;
  nom: string;
}

export interface HopitalLight {
  id: number;
  nom: string;
  type_hopital_nom: string;
}

export interface HopitalExamen {
  id: number;
  hopital: number;
  hopital_nom: string;
  examen: number;
  examen_nom: string;
}

export interface PaginatedHopitaux {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: HopitalLight[];
}

export interface HopitalExamens {
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
  examens: HopitalExamen[];
}

export const examenAPI = {
  getAll: () => api.get<ExamenMedical[]>("/examens/"),
  getById: (id: number) => api.get<ExamenMedical>(`/examens/${id}/`),
  create: (data: { nom: string }) => api.post<ExamenMedical>("/examens/", data),
  update: (id: number, data: { nom: string }) =>
    api.put<ExamenMedical>(`/examens/${id}/`, data),
  delete: (id: number) => api.delete(`/examens/${id}/`),

  getHopitaux: (params?: { search?: string; page?: number; page_size?: number }) =>
    api.get<PaginatedHopitaux>("/examens/hopitaux/", { params }),

  getAssociations: (hopitalId: number) =>
    api.get<HopitalExamens>(`/examens/associations/${hopitalId}/`),

  bulkSetAssociations: (hopitalId: number, examenIds: number[]) =>
    api.post(`/examens/associations/${hopitalId}/bulk/`, {
      examens: examenIds,
    }),

  deleteAssociation: (hopitalId: number, examenId: number) =>
    api.delete(`/examens/associations/${hopitalId}/${examenId}/`),

  exportExcel: (hopitalId: number) => {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const token = localStorage.getItem("access_token");
    return fetch(`${API_BASE_URL}/examens/export/${hopitalId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
