import authRouters from "./routers/AuthRouters";
import userRouters from "./routers/UserRouters";
import codeRouters from "./routers/CodeRouters";
import adminRouters from "./routers/AdminRouters";

const API = {
  auth: authRouters,
  user: userRouters,
  code: codeRouters,
  admin: adminRouters,
};

export default API;
