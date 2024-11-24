// components/DarkReaderToggle.tsx
import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import dynamic from "next/dynamic";

// The actual toggle component
const ToggleComponent = () => {
  const [isDark, setIsDark] = React.useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("darkMode") === "true"
      : false
  );
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const initDarkReader = async () => {
      const darkReader = await import("darkreader");
      const savedMode = localStorage.getItem("darkMode") === "true";
      if (savedMode) {
        darkReader.enable({
          brightness: 100,
          contrast: 100,
          sepia: 0,
        });
      }
      setIsDark(savedMode);
      setMounted(true);
    };

    initDarkReader();
  }, []);

  const toggleDarkMode = async () => {
    const darkReader = await import("darkreader");
    const newIsDark = !isDark;

    if (newIsDark) {
      darkReader.enable({
        brightness: 100,
        contrast: 100,
        sepia: 0,
      });
    } else {
      darkReader.disable();
    }

    localStorage.setItem("darkMode", String(newIsDark));
    setIsDark(newIsDark);
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <IconButton
        sx={{
          width: 40,
          height: 40,
          visibility: "hidden",
        }}
      />
    );
  }

  return (
    <Tooltip title={isDark ? "Light Mode" : "Dark Mode"}>
      <IconButton
        onClick={toggleDarkMode}
        sx={{
          color: isDark ? "#fff" : "#1976d2",
          backgroundColor: isDark
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(25, 118, 210, 0.04)",
          "&:hover": {
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.12)"
              : "rgba(25, 118, 210, 0.08)",
          },
          transition: "all 0.2s ease-in-out",
          borderRadius: "50%",
          padding: 1.2,
          marginLeft: 1,
          "& svg": {
            fontSize: "1.5rem",
            transition: "transform 0.2s ease-in-out",
          },
          "&:hover svg": {
            transform: "rotate(10deg)",
          },
        }}
      >
        {isDark ? (
          <Brightness7Icon sx={{ color: "inherit" }} />
        ) : (
          <Brightness4Icon sx={{ color: "inherit" }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

// Export the dynamic component with SSR disabled
const DarkReaderToggle = dynamic(() => Promise.resolve(ToggleComponent), {
  ssr: false,
});

export default DarkReaderToggle;
