import authRouters from "./routers/AuthRouters";
import userRouters from "./routers/UserRouters";
import blogPostRouters from "./routers/BlogPostRouters";

const API = {
  auth: authRouters,
  user: userRouters,
  blogpost: blogPostRouters
};

export default API;
