import axios, { authAxiosInstance, getJWTHeader } from "../Axios";

const routers = {
  execute: async (payload: object) => axios.post("/code/execute", payload),
  template: async (payload: object, accessToken: string) =>
    authAxiosInstance.post("/code/template", payload, getJWTHeader(accessToken)),
};

export default routers;
