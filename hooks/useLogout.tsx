import { useRouter } from "next/router";
import useAuth from "./useAuth";
import API from "@/routes/API";

const useLogout = () => {
  const { setAuth } = useAuth();
  const router = useRouter();

  const logout = async () => {
    setAuth({});

    try {
      await API.auth.logout();
      router.replace("/");
    } catch (err) {
      console.error(err);
    }
  };

  return logout;
};

export default useLogout;
