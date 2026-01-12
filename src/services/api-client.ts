import axios from "axios";
import { getToken, clearAllAuth } from "../utils/token-storage";

const baseURL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      clearAllAuth();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    const errorMessage =
      error.response?.data?.message || error.message || "Lỗi hệ thống";

    return Promise.reject(errorMessage);
  }
);

export default apiClient;
