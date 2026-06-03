import { useEffect }
from "react";

import {
  useNavigate,
} from "react-router-dom";

import PageLoader
from "@shared/components/ui/PageLoader";

import api from "@shared/lib/api";

// Helper to get cookie value by name
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

// Helper to delete a cookie
const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

function AuthCallback() {

  const navigate =
    useNavigate();

  useEffect(() => {
    // Extract tokens securely from temporary cookies
    const accessToken = getCookie("temp_access_token");
    const refreshToken = getCookie("temp_refresh_token");

    // Immediately clear the cookies for security
    if (accessToken) deleteCookie("temp_access_token");
    if (refreshToken) deleteCookie("temp_refresh_token");

    /*
    ====================
    GITHUB SUCCESS
    ====================
    */

    const handleGithubSuccess = async () => {
      if (accessToken && refreshToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        try {
          const res = await api.get("/api/user/me", {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          if (res.data?.success && res.data.user) {
            localStorage.setItem("userName", res.data.user.name || res.data.user.username);
            if (res.data.user.avatar) {
              localStorage.setItem("userAvatar", res.data.user.avatar);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user details during login", error);
        }

        navigate("/dashboard", { replace: true });
      }
    };

    if (accessToken && refreshToken) {
      handleGithubSuccess();
      return;
    }

    /*
    ====================
    ALREADY LOGGED IN
    ====================
    */

    const storedAccessToken =
      localStorage.getItem(
        "accessToken"
      );

    const storedRefreshToken =
      localStorage.getItem(
        "refreshToken"
      );

    if (
      storedAccessToken &&
      storedRefreshToken
    ) {

      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );

      return;
    }

    /*
    ====================
    LOGIN FAILED
    ====================
    */

    navigate(
      "/login?error=github",
      {
        replace: true,
      }
    );

  }, [navigate]);

  return (
    <PageLoader />
  );
}

export default AuthCallback;
