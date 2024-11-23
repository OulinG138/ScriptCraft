import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  Avatar,
  CircularProgress,
  Menu,
  MenuItem,
} from "@mui/material";
import useAuth from "@/hooks/useAuth";
import useLogout from "@/hooks/useLogout";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import API from "@/routes/API";

const NavbarContent = () => {
  const { auth } = useAuth();
  const logout = useLogout();
  const router = useRouter();
  const isLoggedIn = Boolean(auth?.accessToken && auth?.user);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loadingAvatar, setLoadingAvatar] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const navLinks = [
    { text: "placeholder", href: "/" },
    { text: "placeholder", href: "/" },
    { text: "placeholder", href: "/" },
    { text: "placeholder", href: "/" },
    ...(auth.user?.isAdmin
      ? [{ text: "Reports", href: "/admin/reports/comments" }]
      : []),
  ];

  useEffect(() => {
    const fetchAvatar = async () => {
      if (isLoggedIn && auth.user?.avatarId) {
        try {
          setLoadingAvatar(true);
          const response = await API.user.getAvatarById(auth.user.avatarId);
          setAvatarUrl(response.data.imagePath);
        } catch (error) {
          console.error("Failed to fetch avatar:", error);
        } finally {
          setLoadingAvatar(false);
        }
      }
    };
    fetchAvatar();
  }, [isLoggedIn, auth.user?.avatarId]);

  const handleLogoutClick = () => {
    logout();
    handleMenuClose();
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold text-gray-800">
          Scriptorium
        </Link>

        <div className="lg:hidden">
          {isLoggedIn ? (
            <>
              {loadingAvatar ? (
                <CircularProgress size={24} />
              ) : (
                <Avatar
                  alt={auth.user?.lastName || "User"}
                  src={avatarUrl || ""}
                  onClick={handleAvatarClick}
                  sx={{ cursor: "pointer", width: 40, height: 40 }}
                />
              )}
            </>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button
                  color="primary"
                  size="small"
                  sx={{
                    border: "1px solid",
                    color: "primary.main",
                    borderColor: "primary.main",
                    backgroundColor: "white",
                    "&:hover": {
                      backgroundColor: "primary.light",
                    },
                  }}
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="contained" color="primary" size="small">
                  Signup
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-2 lg:gap-4">
        {navLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="text-gray-700 hover:text-blue-600 py-2 lg:py-0 px-3 border-b lg:border-b-0 last:border-b-0"
          >
            {link.text}
          </Link>
        ))}
      </div>

      <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center gap-4">
        {isLoggedIn ? (
          <>
            {loadingAvatar ? (
              <CircularProgress size={24} />
            ) : (
              <Avatar
                alt={auth.user?.lastName || "User"}
                src={avatarUrl || ""}
                onClick={handleAvatarClick}
                sx={{ cursor: "pointer", width: 40, height: 40 }}
              />
            )}
          </>
        ) : (
          <>
            <Link href="/login">
              <Button
                color="primary"
                sx={{
                  border: "1px solid",
                  color: "primary.main",
                  borderColor: "primary.main",
                  backgroundColor: "white",
                  "&:hover": {
                    backgroundColor: "primary.light",
                  },
                }}
              >
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="contained" color="primary">
                Signup
              </Button>
            </Link>
          </>
        )}
      </div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => router.push("/profile")}>Profile</MenuItem>
        <MenuItem onClick={handleLogoutClick}>Log out</MenuItem>
      </Menu>
    </div>
  );
};

const DynamicNavbarContent = dynamic(() => Promise.resolve(NavbarContent), {
  ssr: false,
});

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md px-4 py-2 sticky top-0 z-50">
      <DynamicNavbarContent />
    </nav>
  );
};

export default Navbar;
