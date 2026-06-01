import { useEffect }
from "react";

import {
  useNavigate,
} from "react-router-dom";

import PageLoader
from "@shared/components/ui/PageLoader";

import api from "@shared/lib/api";

function AuthCallback() {

  const navigate =
    useNavigate();

  useEffect(() => {

    const params =
      new URLSearchParams(
        window.location.search
      );

    const accessToken =
      params.get(
        "accessToken"
      );

    const refreshToken =
      params.get(
        "refreshToken"
      );

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
