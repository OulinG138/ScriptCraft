import axios from "axios";
import API from "./API";

const API_BASE_URL = "http://localhost:3000/api";

const getJWTHeader = (accessToken: string) => {
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  };
};

const openAxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

const authAxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

authAxiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const prevRequest = error?.config;
    if (error?.response?.status === 401 && !prevRequest?._retry) {
      prevRequest._retry = true;
      try {
        const response = await API.auth.refreshToken();
        const newAccessToken = response?.data?.accessToken || "";
        localStorage.setItem("accessToken", newAccessToken);
        prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return authAxiosInstance(prevRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default openAxiosInstance;
export { authAxiosInstance, getJWTHeader };
