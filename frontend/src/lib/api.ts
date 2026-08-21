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
    return api.post<User>("/auth/profile/photo/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      method: "PUT",
    });
  },
  deletePhoto: () => api.delete<User>("/auth/profile/photo/"),
  changePassword: (data: {
    ancien_mot_de_passe: string;
    nouveau_mot_de_passe: string;
    confirmation: string;
  }) => api.post("/auth/profile/change-password/", data),
};
