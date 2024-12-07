import React from "react";
import { Box, Typography } from "@mui/material";

export default function NotFound() {
  return (
    <div
      style={{
        background: "linear-gradient(to bottom, #3f51b5 50%, #ffffff)",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <Box
        component="main"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          sx={{
            color: "#ffffff",
            marginBottom: 1,
            fontWeight: 700,
          }}
        >
          404
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          sx={{
            color: "#ffffff",
          }}
        >
          Oops! The page you're looking for doesn't exist.
        </Typography>
      </Box>
    </div>
  );
}
