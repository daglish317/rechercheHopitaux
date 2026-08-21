import api from "./api";

export interface TypeHopital {
  id: number;
  nom: string;
}

export const typeHopitalAPI = {
  getAll: () => api.get<TypeHopital[]>("/types-hopitaux/"),
  getById: (id: number) => api.get<TypeHopital>(`/types-hopitaux/${id}/`),
  create: (data: { nom: string }) => api.post<TypeHopital>("/types-hopitaux/", data),
  update: (id: number, data: { nom: string }) =>
    api.put<TypeHopital>(`/types-hopitaux/${id}/`, data),
  delete: (id: number) => api.delete(`/types-hopitaux/${id}/`),
};
