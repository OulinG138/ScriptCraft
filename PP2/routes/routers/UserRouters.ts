import axios, { authAxiosInstance, getJWTHeader } from "../Axios";

const routers = {
  getAvatars: async () => axios.get("/user/avatars"),
  getAvatarById: async (avatarId: number) =>
    axios.get(`/user/avatars/${avatarId}`),
  getUserProfile: async (accessToken: string) =>
    authAxiosInstance.get("/user/profile", getJWTHeader(accessToken)),
  updateUserProfile: async (accessToken: string, payload: object) =>
    authAxiosInstance.post("/user/profile", payload, getJWTHeader(accessToken)),
};

export default routers;
