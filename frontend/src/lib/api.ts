import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          try {
            const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
              refresh: refreshToken,
            });
            const { access } = response.data;
            localStorage.setItem("access_token", access);
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return api(originalRequest);
          } catch {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            if (typeof window !== "undefined") {
              window.location.href = "/connexion";
            }
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export interface User {
  id: number;
  nom: string;
  email: string;
  role: "UTILISATEUR" | "ADMINISTRATEUR";
  photo: string | null;
  date_creation: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterData {
  nom: string;
  email: string;
  motDePasse: string;
}

export const authAPI = {
  register: (data: RegisterData) => api.post("/auth/register/", data),
  login: (data: { email: string; motDePasse: string }) =>
    api.post<LoginResponse>("/auth/login/", data),
  logout: (refresh: string) => api.post("/auth/logout/", { refresh }),
  getProfile: () => api.get<User>("/auth/profile/"),
  updateProfile: (data: { nom?: string; email?: string }) =>
    api.patch<User>("/auth/profile/", data),
  uploadPhoto: (photo: File) => {
    const formData = new FormData();
    formData.append("photo", photo);
    return api.put<User>("/auth/profile/photo/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deletePhoto: () => api.delete<User>("/auth/profile/photo/"),
  changePassword: (data: {
    ancien_mot_de_passe: string;
    nouveau_mot_de_passe: string;
    confirmation: string;
  }) => api.post("/auth/profile/change-password/", data),
};


export interface Maladie {
  id: number;
  nom: string;
  hopitaux_count?: number;
}

export interface ExamenMedical {
  id: number;
  nom: string;
  hopitaux_count?: number;
}

export interface PlateauTechnique {
  id: number;
  nom: string;
  hopitaux_count?: number;
}

export interface Hopital {
  id: number;
  nom: string;
  adresse: string;
  type_hopital?: {
    id: number;
    nom: string;
  };
}

export interface PaginatedResponse<T> {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: T[];
}

export const maladieAPI = {
  getAll: () => api.get<Maladie[]>("/maladies/"),
  getOne: (id: number) => api.get<Maladie>(`/maladies/${id}/`),
  create: (data: { nom: string }) => api.post<Maladie>("/maladies/", data),
  update: (id: number, data: { nom: string }) => api.put<Maladie>(`/maladies/${id}/`, data),
  delete: (id: number) => api.delete(`/maladies/${id}/`),
  importExcel: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/maladies/import/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  exportExcel: () => api.get("/maladies/export-all/", { responseType: "blob" }),
  associateHopitaux: (id: number, data: { hopital_ids: number[]; action: "add" | "remove" }) =>
    api.post(`/maladies/${id}/associate-hopitaux/`, data),
  bulkDelete: (data: { ids: number[]; force?: boolean }) =>
    api.post("/maladies/bulk-delete/", data),
};

export const examenAPI = {
  getAll: () => api.get<ExamenMedical[]>("/examens/"),
  getOne: (id: number) => api.get<ExamenMedical>(`/examens/${id}/`),
  create: (data: { nom: string }) => api.post<ExamenMedical>("/examens/", data),
  update: (id: number, data: { nom: string }) => api.put<ExamenMedical>(`/examens/${id}/`, data),
  delete: (id: number) => api.delete(`/examens/${id}/`),
  importExcel: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/examens/import/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  exportExcel: () => api.get("/examens/export-all/", { responseType: "blob" }),
  associateHopitaux: (id: number, data: { hopital_ids: number[]; action: "add" | "remove" }) =>
    api.post(`/examens/${id}/associate-hopitaux/`, data),
  bulkDelete: (data: { ids: number[]; force?: boolean }) =>
    api.post("/examens/bulk-delete/", data),
};

export const plateauAPI = {
  getAll: () => api.get<PlateauTechnique[]>("/plateau-technique/"),
  getOne: (id: number) => api.get<PlateauTechnique>(`/plateau-technique/${id}/`),
  create: (data: { nom: string }) => api.post<PlateauTechnique>("/plateau-technique/", data),
  update: (id: number, data: { nom: string }) =>
    api.put<PlateauTechnique>(`/plateau-technique/${id}/`, data),
  delete: (id: number) => api.delete(`/plateau-technique/${id}/`),
  importExcel: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/plateau-technique/import/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  exportExcel: () => api.get("/plateau-technique/export-all/", { responseType: "blob" }),
  associateHopitaux: (id: number, data: { hopital_ids: number[]; action: "add" | "remove" }) =>
    api.post(`/plateau-technique/${id}/associate-hopitaux/`, data),
  bulkDelete: (data: { ids: number[]; force?: boolean }) =>
    api.post("/plateau-technique/bulk-delete/", data),
};


export const hopitalAPI = {
  getAll: (params?: { search?: string; page?: number; page_size?: number }) =>
    api.get<PaginatedResponse<Hopital>>("/hopitaux/", { params }),
  getOne: (id: number) => api.get<Hopital>(`/hopitaux/${id}/`),
};
