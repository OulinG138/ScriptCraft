import axios, { authAxiosInstance, getJWTHeader } from "../Axios";

const routers = {
  execute: async (payload: object) => axios.post("/code/execute", payload),
  getTemplate: async (id:number) => axios.get("/code/template/" + id),
  template: async (payload: object, accessToken: string) =>
    authAxiosInstance.post("/code/template", payload, getJWTHeader(accessToken)),
};

export default routers;
