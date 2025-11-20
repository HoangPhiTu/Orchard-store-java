"use client";

import axios from "axios";
import Cookies from "js-cookie";
import { forceLogout } from "@/stores/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const TOKEN_KEY =
  process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY ?? "orchard_admin_token";

const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const token = Cookies.get(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      Cookies.remove(TOKEN_KEY);
      if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_KEY);
        forceLogout();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default http;
