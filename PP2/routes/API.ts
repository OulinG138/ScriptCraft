import authRouters from "./routers/AuthRouters";
import userRouters from "./routers/UserRouters";
import blogPostRouters from "./routers/BlogPostRouters";
import codeRouters from "./routers/CodeRouters"

const API = {
  auth: authRouters,
  user: userRouters,
  blogpost: blogPostRouters,
  code: codeRouters
};

export default API;
