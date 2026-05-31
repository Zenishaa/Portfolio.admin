import { useEffect }
from "react";

import {
  useNavigate,
} from "react-router-dom";

import PageLoader
from "../components/ui/PageLoader";

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

    if (
      accessToken &&
      refreshToken
    ) {

      localStorage.setItem(
        "accessToken",
        accessToken
      );

      localStorage.setItem(
        "refreshToken",
        refreshToken
      );

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