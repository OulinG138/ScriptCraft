import axios, { authAxiosInstance, getJWTHeader } from "../Axios";

const routers = {
  execute: async (payload: object) => axios.post("/code/execute", payload),
  getTemplate: async (id:number) => axios.get("/code/template/" + id),
  editTemplate: async (id:number, payload: object, accessToken: string) => 
    authAxiosInstance.put("/code/template/" + id, payload, getJWTHeader(accessToken)),
  forkTemplate: async(id:number, accessToken: string) => 
    authAxiosInstance.post("/code/template/" + id, undefined, getJWTHeader(accessToken)),
  deleteTemplate: async(id:number, accessToken: string) => 
    authAxiosInstance.delete("/code/template/" + id, getJWTHeader(accessToken)),
  template: async (payload: object, accessToken: string) =>
    authAxiosInstance.post("/code/template", payload, getJWTHeader(accessToken)),
  getPaginatedTemplates: async (
    accessToken: string | undefined,
    search: string,
    tags: string[],
    page: number,
    limit: number
  ) => {
    const queryParams: Record<string, string> = {
      search,
      searchTags: tags.join(", "),
      page: page.toString(),
      limit: limit.toString(),
    };
    const queryString = new URLSearchParams(queryParams).toString();
    if (accessToken) {
      return authAxiosInstance.get(`/code/search?${queryString}`, getJWTHeader(accessToken));
    } else {
      return authAxiosInstance.get(`/code/search?${queryString}`);
    }
  },
  getUserTemplates: async (
    accessToken: string | undefined,
    search: string,
    tags: string[],
    page: number,
    limit: number
  ) => {
    const queryParams: Record<string, string> = {
      search,
      searchTags: tags.join(", "),
      page: page.toString(),
      limit: limit.toString(),
    };
    const queryString = new URLSearchParams(queryParams).toString();
    if (accessToken) {
      return authAxiosInstance.get(`/user/templates?${queryString}`, getJWTHeader(accessToken));
    } else {
      return authAxiosInstance.get(`/user/templates?${queryString}`);
    }
  },
};

export default routers;
