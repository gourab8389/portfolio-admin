import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";
const token = Cookies.get("token");

export const PublicApiInstance = () => {
  return axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const AuthApiInstance = axios.create({
  baseURL: `${API_URL}/api/auth`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const AdminApiInstance = axios.create({
  baseURL: `${API_URL}/api/admin`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});

const addAuthInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = Cookies.get("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

addAuthInterceptor(AuthApiInstance);
addAuthInterceptor(AdminApiInstance);


