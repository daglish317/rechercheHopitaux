import api from "./api";

export interface PlateauTechnique {
  id: number;
  nom: string;
}

export interface HopitalPlateauTechnique {
  id: number;
  hopital: number;
  hopital_nom: string;
  plateau_technique: number;
  plateau_technique_nom: string;
}

export const plateauTechniqueAPI = {
  getAll: () => api.get<PlateauTechnique[]>("/plateau-technique/"),
  getById: (id: number) => api.get<PlateauTechnique>(`/plateau-technique/${id}/`),
  create: (data: { nom: string }) =>
    api.post<PlateauTechnique>("/plateau-technique/", data),
  update: (id: number, data: { nom: string }) =>
    api.put<PlateauTechnique>(`/plateau-technique/${id}/`, data),
  delete: (id: number) => api.delete(`/plateau-technique/${id}/`),
};

export const hopitalPlateauTechniqueAPI = {
  getAll: () => api.get<HopitalPlateauTechnique[]>("/plateau-technique/associations/"),
  create: (data: { hopital: number; plateau_technique: number }) =>
    api.post<HopitalPlateauTechnique>("/plateau-technique/associations/", data),
  delete: (id: number) => api.delete(`/plateau-technique/associations/${id}/`),
};
