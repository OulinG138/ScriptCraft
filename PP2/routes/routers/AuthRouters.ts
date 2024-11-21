import axios, { authAxiosInstance } from "../Axios";

const routers = {
  register: async (payload: object) => axios.post("/auth/signup", payload),
  login: async (payload: object) =>
    authAxiosInstance.post("/auth/login", payload),
  refreshToken: async () => authAxiosInstance.post("/auth/refresh"),
  logout: async () => authAxiosInstance.get("/auth/logout"),
};

export default routers;
