import { authAxiosInstance, getJWTHeader } from "../Axios";

const routers = {
  getBlogPost: async(accessToken: string | undefined, postId: Number) => {
    if (accessToken) {
      return authAxiosInstance.get(`/posts/${postId}`, getJWTHeader(accessToken));
    } else {
      return authAxiosInstance.get(`/posts/${postId}`);
    }},
  postBlogPost: async (accessToken: string, payload: object) =>
    authAxiosInstance.post("/posts", payload, getJWTHeader(accessToken)),
  updateBlogPost: async (accessToken: string, postId: number, payload: object) =>
    authAxiosInstance.put(`/posts/${postId}`, payload, getJWTHeader(accessToken)),
  getPaginatedBlogPosts: async (
    accessToken: string | undefined,
    search: string,
    tags: string[],
    sortBy: string,
    page: number,
    limit: number
  ) => {
    const queryParams: Record<string, string> = {
      search,
      searchTags: tags.join(", "),
      sortBy,
      page: page.toString(),
      limit: limit.toString(),
    };
    const queryString = new URLSearchParams(queryParams).toString();
    if (accessToken) {
      return authAxiosInstance.get(`/posts?${queryString}`, getJWTHeader(accessToken));
    } else {
      return authAxiosInstance.get(`/posts?${queryString}`);
    }
  },
  getUserBlogPosts: async (
    accessToken: string,
    search: string,
    tags: string[],
    sortBy: string,
    page: number,
    limit: number
  ) => {
    const queryParams: Record<string, string> = {
      search,
      searchTags: tags.join(", "),
      sortBy,
      page: page.toString(),
      limit: limit.toString(),
    };
    const queryString = new URLSearchParams(queryParams).toString();
    return authAxiosInstance.get(`/user/posts?${queryString}`, getJWTHeader(accessToken));
  },
  postComment: async (accessToken: string, postId: Number, payload: object) => 
    authAxiosInstance.post(`/posts/${postId}/comments`, payload, getJWTHeader(accessToken)),   
  postRating: async (accessToken: string, payload: object) => 
    authAxiosInstance.post(`/ratings`, payload, getJWTHeader(accessToken)),  
  deleteRating: async(accessToken: string, ratingId: number) => 
    authAxiosInstance.delete(`/ratings/${ratingId}`, getJWTHeader(accessToken)), 
  getRating: async (accessToken: string | undefined, postId: Number, page: Number) => {
    if (accessToken) {
    authAxiosInstance.get(`/posts/${postId}/ratings`, getJWTHeader(accessToken))
    } else {
      authAxiosInstance.get(`/posts/${postId}/ratings`)
    }},  
  postReport: async (accessToken: string, payload: object) => 
    authAxiosInstance.post(`/reports`, payload, getJWTHeader(accessToken)),
  getPaginatedComments: async (
    accessToken: string | undefined,
    postId: Number,
    sortBy: string,
    page: number,
    limit: number
  ) => {
    const queryParams: Record<string, string> = {
      sortBy,
      page: page.toString(),
      limit: limit.toString(),
    };
    const queryString = new URLSearchParams(queryParams).toString();
    if (accessToken) {
      return authAxiosInstance.get(`/posts/${postId}/comments/?${queryString}`, getJWTHeader(accessToken));
    } else {
      return authAxiosInstance.get(`/posts/${postId}/comments/?${queryString}`);
    }
  },
  getPaginatedReplies: async (
    accessToken: string | undefined,
    commentId: Number,
    page: number,
    limit: number
  ) => {
    const queryParams: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };
    const queryString = new URLSearchParams(queryParams).toString();
    if (accessToken) {
      return authAxiosInstance.get(`/comments/${commentId}/replies?${queryString}`, getJWTHeader(accessToken));
    } else {
      return authAxiosInstance.get(`/comments${commentId}/replies?${queryString}`);
    }
  },
}
export default routers;
