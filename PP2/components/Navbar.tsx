import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Button,
  Avatar,
  CircularProgress,
  Menu,
  MenuItem,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import useAuth from "@/hooks/useAuth";
import useLogout from "@/hooks/useLogout";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import API from "@/routes/API";
import DarkReaderToggle from "./DarkReaderToggle";

const NavbarContent = () => {
  const { auth } = useAuth();
  const logout = useLogout();
  const router = useRouter();
  const isLoggedIn = Boolean(auth?.accessToken && auth?.user);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loadingAvatar, setLoadingAvatar] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navLinks = [
    { text: "Blog Posts", href: "/posts" },
    { text: "Code Templates", href: "/code-templates" },
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

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row lg:items-center gap-4">
      {/* Top row with logo and hamburger */}
      <div className="flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold text-gray-800">
          Scriptorium
        </Link>

        <div className="lg:hidden">
          <IconButton onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
        </div>
      </div>

      {/* Full navigation for larger screens */}
      <div className="hidden lg:flex lg:flex-row gap-2 lg:gap-4">
        {navLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="text-gray-700 hover:text-blue-600 py-2 px-3 border-b lg:border-b-0"
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
              <>
                <Avatar
                  alt={auth.user?.lastName || "User"}
                  src={avatarUrl || ""}
                  onClick={handleAvatarClick}
                  sx={{ cursor: "pointer", width: 40, height: 40 }}
                />
                <DarkReaderToggle />
              </>
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
            <DarkReaderToggle />
          </>
        )}
      </div>

      {/* Hamburger Drawer for small screens */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: 280,
          },
        }}
      >
        {/* User profile section at the top of sidebar */}
        {isLoggedIn && (
          <div className="p-4 bg-gray-50 flex flex-col items-center space-y-2">
            {loadingAvatar ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <Avatar
                  alt={auth.user?.lastName || "User"}
                  src={avatarUrl || ""}
                  sx={{ width: 64, height: 64 }}
                />
                <Typography
                  variant="subtitle1"
                  className="font-medium text-gray-800"
                >
                  {`${auth.user?.firstName} ${auth.user?.lastName}`}
                </Typography>
                <DarkReaderToggle />
              </>
            )}
          </div>
        )}

        <List>
          {!isLoggedIn && (
            <ListItem>
              <div className="w-full flex justify-center">
                <DarkReaderToggle />
              </div>
            </ListItem>
          )}
          {navLinks.map((link, index) => (
            <ListItem
              key={index}
              component={Link}
              href={link.href}
              onClick={toggleDrawer(false)}
            >
              <ListItemText primary={link.text} />
            </ListItem>
          ))}
          {isLoggedIn ? (
            <>
              <ListItem component={Link} href="/profile">
                <ListItemText primary="Profile" />
              </ListItem>
              <ListItem component={Link} href="/user/posts">
                <ListItemText primary="My Posts" />
              </ListItem>
              <ListItem component={Link} href="/user/code-templates">
                <ListItemText primary="My Code Templates" />
              </ListItem>
              <ListItem
                onClick={() => {
                  logout();
                  toggleDrawer(false)();
                }}
              >
                <ListItemText primary="Log out" />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem component={Link} href="/login">
                <ListItemText primary="Login" />
              </ListItem>
              <ListItem component={Link} href="/signup">
                <ListItemText primary="Signup" />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>

      {/* Menu for Avatar options */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => router.push("/profile")}>Profile</MenuItem>

        <MenuItem onClick={() => router.push("/user/posts")}>My Posts</MenuItem>
        <MenuItem onClick={() => router.push("/user/code-templates")}>
          My Code Templates
        </MenuItem>

        <MenuItem
          onClick={() => {
            logout();
            handleMenuClose();
          }}
        >
          Log out
        </MenuItem>
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
