import { useRouter } from "next/router";
import useAuth from "./useAuth";
import API from "@/routes/API";

const useLogout = () => {
  const { setAuth } = useAuth();
  const router = useRouter();

  const logout = async () => {
    try {
      const response = await API.auth.logout();
      router.replace("/login");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setAuth({});
    } catch (err) {
      console.error(err);
    }
  };

  return logout;
};

export default useLogout;
