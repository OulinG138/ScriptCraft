import * as React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";
import _ from "lodash";

import {
  Button,
  Container,
  TextField,
  Paper,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import BackgroundImage from "@/assets/images/login-background.jpg";
import useAuth from "@/hooks/useAuth";
import API from "@/routes/API";

export default function Login() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);

  const handleShowPasswordClick = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    let submission = {
      email: data.get("email"),
      password: data.get("password"),
    };

    try {
      setLoading(true);
      const response = await API.auth.login(submission);
      let auth = response.data;
      console.log(auth);
      let accessToken = auth?.accessToken || null;
      console.log(accessToken);

      if (!_.isNil(accessToken)) {
        setAuth({ user: auth.user, accessToken: accessToken });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.replace("/");
      } else {
        throw new Error("No user or access token found");
      }
    } catch (error: any) {
      console.log(error);
      toast.error("Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
        onClick={() => {}}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Image
        src={BackgroundImage}
        alt="background"
        fill
        priority
        placeholder="blur"
        className="absolute inset-0 object-cover"
      />
      <Container
        component="main"
        maxWidth="sm"
        className="relative z-10 flex flex-col items-center justify-center"
      >
        <Paper className="p-12 rounded-3xl shadow-md w-full max-w-xl">
          <Typography variant="h4" component="h1" className="text-center mb-10">
            Login
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              className="mb-4"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              className="mb-4"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleShowPasswordClick}
                      onMouseDown={handleMouseDownPassword}
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="mt-4 rounded-full py-2 bg-blue-500 hover:bg-blue-700"
            >
              LOGIN
            </Button>
            <Box display="flex" justifyContent="center" className="mt-4">
              Don’t have an account?
              <Link href="/signup">
                <Typography className="text-blue-500 underline inline ml-2">
                  Sign up
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </div>
  );
}
