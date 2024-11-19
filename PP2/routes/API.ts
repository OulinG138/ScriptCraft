import authRouters from "./routers/AuthRouters";
import userRouters from "./routers/UserRouters";

const API = {
  auth: authRouters,
  user: userRouters,
};

export default API;
