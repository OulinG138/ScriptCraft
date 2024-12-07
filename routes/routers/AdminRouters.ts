import { authAxiosInstance, getJWTHeader } from "../Axios";

const routers = {
  getReportById: async (accessToken: string, reportId: number) =>
    authAxiosInstance.get(
      `/admin/reports/${reportId}`,
      getJWTHeader(accessToken)
    ),
  hideReportById: async (
    accessToken: string,
    reportId: number,
    payload: object
  ) =>
    authAxiosInstance.put(
      `/admin/reports/${reportId}/hide`,
      payload,
      getJWTHeader(accessToken)
    ),
  resolveReportById: async (accessToken: string, reportId: number) =>
    authAxiosInstance.put(
      `/admin/reports/${reportId}/resolve`,
      getJWTHeader(accessToken)
    ),
  getReportedComments: async (
    accessToken: string,
    sort?: string,
    page?: number,
    limit?: number
  ) =>
    authAxiosInstance.get(`/admin/reports/comments`, {
      params: { sort, page, limit },
      headers: getJWTHeader(accessToken).headers,
    }),
  getReportedPosts: async (
    accessToken: string,
    sort?: string,
    page?: number,
    limit?: number
  ) =>
    authAxiosInstance.get(`/admin/reports/posts`, {
      params: { sort, page, limit },
      headers: getJWTHeader(accessToken).headers,
    }),
};

export default routers;
