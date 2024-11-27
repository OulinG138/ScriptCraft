import axios, { authAxiosInstance, refreshAxiosInstance } from "../Axios";

const routers = {
  register: async (payload: object) => axios.post("/auth/signup", payload),
  login: async (payload: object) =>
    authAxiosInstance.post("/auth/login", payload),
  refreshToken: async () => refreshAxiosInstance.post("/auth/refresh"),
  logout: async () => authAxiosInstance.get("/auth/logout"),
};

export default routers;
