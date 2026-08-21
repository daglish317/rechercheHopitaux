import api from "./api";

export interface Maladie {
  id: number;
  nom: string;
}

export const maladieAPI = {
  getAll: () => api.get<Maladie[]>("/maladies/"),
  getById: (id: number) => api.get<Maladie>(`/maladies/${id}/`),
  create: (data: { nom: string }) => api.post<Maladie>("/maladies/", data),
  update: (id: number, data: { nom: string }) =>
    api.put<Maladie>(`/maladies/${id}/`, data),
  delete: (id: number) => api.delete(`/maladies/${id}/`),
};
