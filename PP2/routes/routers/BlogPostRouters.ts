import { authAxiosInstance, getJWTHeader } from "../Axios";

const routers = {
  getBlogPost: async(accessToken: string | undefined, postId: Number) => {
    if (accessToken) {
      return authAxiosInstance.get(`/posts/${postId}`, getJWTHeader(accessToken));
    } else {
      return authAxiosInstance.get(`/posts/${postId}/visitor`);
    }},
  postBlogPost: async (accessToken: string, payload: object) =>
    authAxiosInstance.post("/posts", payload, getJWTHeader(accessToken)),
  updateBlogPost: async (accessToken: string, postId: number, payload: object) =>
    authAxiosInstance.put(`/posts/${postId}`, payload, getJWTHeader(accessToken)),
  deleteBlogPost: async (accessToken: string, postId: number) =>
    authAxiosInstance.delete(`/posts/${postId}`,getJWTHeader(accessToken)),
  

  getPaginatedBlogPosts: async (
    accessToken: string | undefined,
    title: string,
    content: string,
    codeTemplate: string,
    tags: string[],
    sortBy: string,
    page: number,
    limit: number
  ) => {
    const queryParams: Record<string, string> = {
      title, content, codeTemplate,
      searchTags: tags.join(", "),
      sortBy,
      page: page.toString(),
      limit: limit.toString(),
    };
    const queryString = new URLSearchParams(queryParams).toString();
    if (accessToken) {
      return authAxiosInstance.get(`/posts?${queryString}`, getJWTHeader(accessToken));
    } else {
      return authAxiosInstance.get(`/posts/visitor?${queryString}`);
    }
  },
  getUserBlogPosts: async (
    accessToken: string,
    title: string,
    content: string,
    codeTemplate: string,
    tags: string[],
    sortBy: string,
    page: number,
    limit: number
  ) => {
    const queryParams: Record<string, string> = {
      title, content, codeTemplate,
      searchTags: tags.join(", "),
      sortBy,
      page: page.toString(),
      limit: limit.toString(),
    };
    const queryString = new URLSearchParams(queryParams).toString();
    return authAxiosInstance.get(`/user/posts?${queryString}`, getJWTHeader(accessToken));
  },

  
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
      return authAxiosInstance.get(`/posts/${postId}/comments/visitor?${queryString}`);
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
      return authAxiosInstance.get(`/comments/${commentId}/replies/visitor?${queryString}`);
    }
  },

  
  deleteComment: async (accessToken: string, commentId: number) =>
    authAxiosInstance.delete(`/comment/${commentId}`,getJWTHeader(accessToken)),
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
}
export default routers;
