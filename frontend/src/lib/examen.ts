import api from "./api";

export interface ExamenMedical {
  id: number;
  nom: string;
}

export interface HopitalExamen {
  id: number;
  hopital: number;
  hopital_nom: string;
  examen: number;
  examen_nom: string;
}

export const examenAPI = {
  getAll: () => api.get<ExamenMedical[]>("/examens/"),
  getById: (id: number) => api.get<ExamenMedical>(`/examens/${id}/`),
  create: (data: { nom: string }) => api.post<ExamenMedical>("/examens/", data),
  update: (id: number, data: { nom: string }) =>
    api.put<ExamenMedical>(`/examens/${id}/`, data),
  delete: (id: number) => api.delete(`/examens/${id}/`),
};

export const hopitalExamenAPI = {
  getAll: () => api.get<HopitalExamen[]>("/examens/associations/"),
  create: (data: { hopital: number; examen: number }) =>
    api.post<HopitalExamen>("/examens/associations/", data),
  delete: (id: number) => api.delete(`/examens/associations/${id}/`),
};
