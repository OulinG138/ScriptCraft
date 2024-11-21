import authRouters from "./routers/AuthRouters";
import userRouters from "./routers/UserRouters";
import codeRouters from "./routers/CodeRouters"

const API = {
  auth: authRouters,
  user: userRouters,
  code: codeRouters
};

export default API;
