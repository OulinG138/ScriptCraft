import "@/styles/globals.css";
import * as React from "react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthProvider";
import { ThemeProvider, CssBaseline } from "@mui/material";
import Navbar from "@/components/Navbar";
import theme from "./theme";

export default function App({ Component, pageProps }: AppProps) {
  const noNavbarRoutes = ["/login", "/signup"];
  const router = useRouter();
  const shouldHideNavbar = noNavbarRoutes.includes(router.pathname);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Toaster position="top-center" />
        {!shouldHideNavbar && <Navbar />}
        <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
  );
}
