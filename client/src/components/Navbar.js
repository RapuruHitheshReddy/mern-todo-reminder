// src/components/Navbar.js
import React from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Tooltip,
  Button,
  useTheme,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";

const Navbar = ({ isAuthenticated, username, onLogout }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleLogout = async () => {
    await onLogout();
    navigate("/login");
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: "#000000",
        color: "#ffffff",
        borderBottom: "1px solid #333",
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center" gap={1}>
          <DashboardIcon sx={{ color: "#ffffff" }} />
          <RouterLink
            to="/"
            style={{ textDecoration: "none", color: "#ffffff" }}
          >
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Todo Dashboard
            </Typography>
          </RouterLink>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          {isAuthenticated ? (
            <>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 400, color: "#ffffff" }}
              >
                👋 Welcome, {username?.split(" ")[0]}
              </Typography>

              <Tooltip title={username}>
                <Avatar
                  sx={{
                    bgcolor: "#ffffff",
                    color: "#000000",
                    fontWeight: "bold",
                    transition: "transform 0.3s ease",
                    "&:hover": { transform: "scale(1.1)" },
                  }}
                >
                  {username?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>
              </Tooltip>

              <IconButton
                onClick={handleLogout}
                sx={{
                  color: "#ffffff",
                  "&:hover": { transform: "scale(1.2)" },
                  transition: "transform 0.3s",
                }}
              >
                <LogoutIcon />
              </IconButton>
            </>
          ) : (
            <>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                sx={{
                  borderColor: "#ffffff",
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: "#222",
                    borderColor: "#ccc",
                  },
                }}
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                sx={{
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  "&:hover": {
                    backgroundColor: "#e0e0e0",
                  },
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
